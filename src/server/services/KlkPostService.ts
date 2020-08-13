import { Lens as MonocleLens } from 'monocle-ts'

import { KlkSearchService } from './KlkSearchService'
import { PartialLogger } from './Logger'
import { Link } from '../models/Link'
import { Listing } from '../models/Listing'
import { KlkPost } from '../models/klkPost/KlkPost'
import { KlkPostId } from '../models/klkPost/KlkPostId'
import { KlkPostPersistence } from '../persistence/KlkPostPersistence'
import { Future, pipe, Maybe, List, IO, Task } from '../../shared/utils/fp'
import { StringUtils } from '../../shared/utils/StringUtils'
import { LinksListing } from '../models/LinksListing'

export type KlkPostService = ReturnType<typeof KlkPostService>

type PollOptions = Readonly<{ all: boolean }>

const pollRedditEvery = 24 * 60 * 60 * 1000

type PollCounter = Readonly<{
  searches: number
  postsFound: number
  postsAlreadyInDb: number
  postsInserted: number
}>

namespace PollCounter {
  export const empty: PollCounter = {
    searches: 0,
    postsFound: 0,
    postsAlreadyInDb: 0,
    postsInserted: 0,
  }

  export namespace Lens {
    export const searches = MonocleLens.fromPath<PollCounter>()(['searches'])
    export const postsFound = MonocleLens.fromPath<PollCounter>()(['postsFound'])
    export const postsAlreadyInDb = MonocleLens.fromPath<PollCounter>()(['postsAlreadyInDb'])
    export const postsInserted = MonocleLens.fromPath<PollCounter>()(['postsInserted'])
  }
}

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
        Future.chain(_ =>
          _ === 0 ? pollReddit({ all: true }) : Future.fromIOEither(logger.info('Nothing to poll')),
        ),
      ),

    scheduleRedditPolling: (): Future<void> => {
      const now = new Date()
      const tomorrow8am = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8)
      const untilTomorrow8am = new Date(tomorrow8am.getTime() - now.getTime())
      return pipe(
        logger.info(
          `Scheduling activity refresh: 8am is in ${untilTomorrow8am.getHours()}h${untilTomorrow8am.getMinutes()}`,
        ),
        IO.chain(_ =>
          pipe(
            Future.fromIOEither(setRefreshActivityInterval()),
            Task.delay(untilTomorrow8am.getTime()),
            IO.runFuture,
          ),
        ),
        Future.fromIOEither,
      )
    },
  }

  function setRefreshActivityInterval(): IO<void> {
    return pipe(
      IO.apply(() =>
        setInterval(() => pipe(pollReddit({ all: false }), Future.runUnsafe), pollRedditEvery),
      ),
      IO.map(_ => {}),
    )
  }

  function pollReddit(options: PollOptions): Future<void> {
    return pipe(
      Future.fromIOEither(logger.info('Start polling')),
      Future.chain(_ => pollRec(options)),
      Future.chain(c =>
        Future.fromIOEither(
          logger.info(
            `End polling - searches: ${c.searches}, posts found: ${c.postsFound}, posts already in db: ${c.postsAlreadyInDb}, posts inserted: ${c.postsInserted}`,
          ),
        ),
      ),
    )
  }

  function pollRec(
    options: PollOptions,
    after?: string,
    pollCounter: PollCounter = PollCounter.empty,
  ): Future<PollCounter> {
    return pipe(
      klkSearchService.search(after),
      Future.chain(found => {
        const newPollCounter = PollCounter.Lens.searches.modify(_ => _ + 1)(pollCounter)
        return pipe(
          found,
          Maybe.fold(
            () => Future.right(newPollCounter),
            _ => syncListing(_, options, newPollCounter),
          ),
        )
      }),
    )
  }

  function syncListing(
    listing: LinksListing,
    options: PollOptions,
    pollCounter: PollCounter,
  ): Future<PollCounter> {
    return pipe(
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
        const newPollCounter = pipe(
          pollCounter,
          PollCounter.Lens.postsFound.modify(_ => _ + listing.data.children.length),
          PollCounter.Lens.postsAlreadyInDb.modify(_ => _ + alreadyInDb.length),
        )
        return pipe(
          logger.debug('alreadyInDb:', printLinkIds(alreadyInDb)),
          IO.chain(_ => logger.debug('    notInDb:', printLinkIds(notInDb))),
          Future.fromIOEither,
          Future.chain(_ =>
            options.all
              ? addToDbAndContinuePolling(notInDb, listing, options, newPollCounter)
              : List.isEmpty(notInDb)
              ? Future.right(newPollCounter)
              : List.isEmpty(alreadyInDb)
              ? addToDbAndContinuePolling(notInDb, listing, options, newPollCounter)
              : addToDb(notInDb, newPollCounter),
          ),
        )
      }),
    )
  }

  function addToDbAndContinuePolling(
    links: Link[],
    listing: Listing,
    options: PollOptions,
    pollCounter: PollCounter,
  ): Future<PollCounter> {
    return pipe(
      addToDb(links, pollCounter),
      Future.chain(newPollCounter =>
        pipe(
          listing.data.after,
          Maybe.fold(
            () => Future.right(newPollCounter),
            after => pollRec(options, after, newPollCounter),
          ),
        ),
      ),
    )
  }

  function addToDb(links: Link[], pollCounter: PollCounter): Future<PollCounter> {
    if (List.isEmpty(links)) return Future.right(pollCounter)

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
      Future.chain(res =>
        pipe(
          res.insertedCount === posts.length
            ? Future.unit
            : Future.fromIOEither(
                logger.error('insertMany: insertedCount was different than inserted length'),
              ),
          Future.map(_ =>
            PollCounter.Lens.postsInserted.modify(_ => _ + res.insertedCount)(pollCounter),
          ),
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
