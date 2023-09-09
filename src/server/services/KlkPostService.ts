import { identity, pipe } from 'fp-ts/function'
import got from 'got'
import path from 'path'

import { MsDuration } from '../../shared/MsDuration'
import { KlkPostsQuery } from '../../shared/models/KlkPostsQuery'
import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Future, List, Maybe, NotUsed } from '../../shared/utils/fp'

import { Config } from '../Config'
import { Dir, MyFile } from '../models/FileOrDir'
import { KlkPost } from '../models/KlkPost'
import { LoggerGetter } from '../models/logger/LoggerGetter'
import { Sink } from '../models/rx/Sink'
import { TObservable } from '../models/rx/TObservable'
import { KlkPostPersistence } from '../persistence/KlkPostPersistence'
import { FsUtils } from '../utils/FsUtils'
import { ProbeUtils } from '../utils/ProbeUtils'

const imgurRemovedPng = 'https://i.imgur.com/removed.png'

export type KlkPostService = ReturnType<typeof KlkPostService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function KlkPostService(
  config: Config,
  Logger: LoggerGetter,
  klkPostPersistence: KlkPostPersistence,
) {
  const logger = Logger('KlkPostService')

  return {
    addMissingSize: addMissingSize(),

    downloadImages: downloadImages(),

    findAll: klkPostPersistence.findAll,

    findAllByQuery: (query: KlkPostsQuery, page: number): Future<List<KlkPost>> =>
      klkPostPersistence.findAllByQuery(query, page),

    updatePostAndGetUpdated: (id: KlkPostId, payload: KlkPostEditPayload): Future<Maybe<KlkPost>> =>
      pipe(
        klkPostPersistence.updatePostById(id, payload),
        Future.chain(ok => (ok ? klkPostPersistence.findById(id) : Future.successful(Maybe.none))),
      ),
  }

  function addMissingSize(): Future<NotUsed> {
    return pipe(
      klkPostPersistence.findWithEmptySize,
      Future.chain(posts =>
        pipe(
          posts,
          List.map(post =>
            pipe(
              ProbeUtils.probeSize(post.url, logger),
              Future.chain(
                Maybe.fold(
                  () => Future.successful(false),
                  size => klkPostPersistence.updateSizeById(post.id, size),
                ),
              ),
            ),
          ),
          Future.sequenceSeqArray,
        ),
      ),
      Future.chain(res =>
        Future.fromIOEither(
          logger.info(`Added missing sizes: ${res.filter(b => b).length}/${res.length}`),
        ),
      ),
    )
  }

  function downloadImages(): Future<NotUsed> {
    return pipe(
      Future.fromIOEither(logger.info('Start images download')),
      Future.chain(() => FsUtils.stat(config.imagesDir)),
      Future.chain(
        Maybe.fold(
          () => FsUtils.mkdir(config.imagesDir, { recursive: true }),
          f =>
            f.isDirectory()
              ? Future.notUsed
              : Future.failed(Error(`"${config.imagesDir.path}" is a file (expected file)`)),
        ),
      ),
      Future.chain(() =>
        pipe(
          klkPostPersistence.findAll,
          TObservable.chainTaskEitherK(post =>
            pipe(
              downloadImageIfNeeded(post),
              Future.orElseIOEitherK(e => logger.warn(`[${post.id}] Error: ${e.message}`)),
              Future.delay(MsDuration.seconds(0.5)),
            ),
          ),
          Sink.toNotUsed,
        ),
      ),
    )
  }

  function downloadImageIfNeeded(post: KlkPost): Future<NotUsed> {
    const file = pipe(config.imagesDir, Dir.joinFile(path.basename(post.url)))
    return pipe(
      FsUtils.stat(file),
      Future.chain(
        Maybe.fold(
          () => downloadImage(post, file),
          f =>
            f.isFile()
              ? pipe(
                  klkPostPersistence.updateNoLongerAvailableById(post.id, false),
                  Future.chainIOEitherK(() =>
                    logger.info(`[${post.id}] Image file already downloaded`),
                  ),
                )
              : Future.failed(Error(`"${file.path}" is a directory (expected file)`)),
        ),
      ),
    )
  }

  function downloadImage(post: KlkPost, file: MyFile): Future<NotUsed> {
    if (pipe(post.noLongerAvailable, Maybe.exists(identity))) {
      return Future.fromIOEither(
        logger.info(`[${post.id}] Already checked, image no longer available`),
      )
    }

    return pipe(
      Future.tryCatch(() => got.get(post.url)),
      Future.chain(res => {
        const noLongerAvailable = pipe(
          res.request.redirects,
          List.last,
          Maybe.exists(r => r === imgurRemovedPng),
        )
        return pipe(
          klkPostPersistence.updateNoLongerAvailableById(post.id, noLongerAvailable),
          Future.chain(() =>
            noLongerAvailable ? Future.notUsed : pipe(res.rawBody, FsUtils.writeFile(file)),
          ),
          Future.chainIOEitherK(() =>
            logger.info(
              `[${post.id}]`,
              noLongerAvailable
                ? 'Tried to download image, but image is no longer available'
                : 'Successfuly downloaded image',
            ),
          ),
        )
      }),
    )
  }
}
