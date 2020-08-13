import { KlkSearchService } from './KlkSearchService'
import { PartialLogger } from './Logger'
import { Link } from '../models/Link'
import { Listing } from '../models/Listing'
import { KlkPost } from '../models/klkPost/KlkPost'
import { KlkPostId } from '../models/klkPost/KlkPostId'
import { KlkPostPersistence } from '../persistence/KlkPostPersistence'
import { Future, pipe, Maybe, List, IO } from '../../shared/utils/fp'
import { StringUtils } from '../../shared/utils/StringUtils'

export type KlkPostService = ReturnType<typeof KlkPostService>

type PollOptions = Readonly<{ all: boolean }>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostService(
  Logger: PartialLogger,
  klkPostPersistence: KlkPostPersistence,
  klkSearchService: KlkSearchService,
) {
  const logger = Logger('KlkPostService')

  return {
    initDbIfEmpty: (): Future<void> =>
      pipe(
        klkPostPersistence.count(),
        Future.chain(_ => (_ === 0 ? pollReddit({ all: true }) : pollReddit({ all: false }))),
      ),
  }

  function pollReddit(options: PollOptions): Future<void> {
    return pipe(
      Future.fromIOEither(logger.info('Start polling')),
      Future.chain(_ => pollRec(options)),
      Future.chain(n => Future.fromIOEither(logger.info(`End polling - ${n} searches`))),
    )
  }

  function pollRec(options: PollOptions, after?: string, searchCount = 1): Future<number> {
    return pipe(
      klkSearchService.search(after),
      Future.chain(
        Maybe.fold(
          () => Future.right(searchCount),
          listing =>
            pipe(
              klkPostPersistence.findByIds(listing.data.children.map(_ => _.data.id)),
              Future.chain(inDb => {
                const { left: notInDb, right: alreadyInDb } = pipe(
                  listing.data.children,
                  List.partition(link =>
                    pipe(
                      inDb,
                      List.exists(_ => _ === link.data.id),
                    ),
                  ),
                )
                return pipe(
                  logger.debug('alreadyInDb:', printLinkIds(alreadyInDb)),
                  IO.chain(_ => logger.debug('    notInDb:', printLinkIds(notInDb))),
                  Future.fromIOEither,
                  Future.chain(_ =>
                    options.all
                      ? addToDbAndContinuePolling(notInDb, listing, options, searchCount)
                      : List.isEmpty(notInDb)
                      ? Future.right(searchCount)
                      : List.isEmpty(alreadyInDb)
                      ? addToDbAndContinuePolling(notInDb, listing, options, searchCount)
                      : pipe(
                          addToDb(notInDb),
                          Future.map(_ => searchCount),
                        ),
                  ),
                )
              }),
            ),
        ),
      ),
    )
  }

  function addToDbAndContinuePolling(
    links: Link[],
    listing: Listing,
    options: PollOptions,
    searchCount: number,
  ): Future<number> {
    return pipe(
      addToDb(links),
      Future.chain(_ =>
        pipe(
          listing.data.after,
          Maybe.fold(
            () => Future.right(searchCount),
            after => pollRec(options, after, searchCount + 1),
          ),
        ),
      ),
    )
  }

  function addToDb(links: Link[]): Future<void> {
    if (List.isEmpty(links)) return Future.unit

    const posts = links.map(KlkPost.fromLink)
    return pipe(
      List.sequence(IO.ioEither)(
        posts.map(p =>
          Maybe.isNone(p.episode) || Maybe.isNone(p.size)
            ? pipe(KlkPost.codec.encode(p), ({ id, title, episode, size }) =>
                pipe(
                  logger.warn(
                    'KlkPost with empty metadata:',
                    JSON.stringify({ id, episode, size }),
                  ),
                  IO.chain(_ => logger.warn('                      title:', JSON.stringify(title))),
                ),
              )
            : IO.unit,
        ),
      ),
      Future.fromIOEither,
      Future.chain(_ => klkPostPersistence.insertMany(posts)),
      Future.chain(_ =>
        _.insertedCount === posts.length
          ? Future.unit
          : Future.fromIOEither(
              logger.error('insertMany: insertedCount was different than inserted length'),
            ),
      ),
    )
  }
}

function printLinkIds(links: Link[]): string {
  const res = pipe(
    links.map(_ => KlkPostId.unwrap(_.data.id)),
    StringUtils.mkString(','),
  )
  return `(${links.length}) ${res}`
}
