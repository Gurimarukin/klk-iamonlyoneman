import { pipe } from 'fp-ts/function'

import { KlkPostsQuery } from '../../shared/models/KlkPostsQuery'
import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Future, List, Maybe, NotUsed } from '../../shared/utils/fp'

import { KlkPost } from '../models/KlkPost'
import { LoggerGetter } from '../models/logger/LoggerGetter'
import { KlkPostPersistence } from '../persistence/KlkPostPersistence'
import { ProbeUtils } from '../utils/ProbeUtils'

export type KlkPostService = ReturnType<typeof KlkPostService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function KlkPostService(Logger: LoggerGetter, klkPostPersistence: KlkPostPersistence) {
  const logger = Logger('KlkPostService')

  return {
    addMissingSize: addMissingSize(),

    downloadImages: downloadImages(),

    findAll: (query: KlkPostsQuery, page: number): Future<List<KlkPost>> =>
      klkPostPersistence.findAll(query, page),

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
    return Future.todo()
  }
}
