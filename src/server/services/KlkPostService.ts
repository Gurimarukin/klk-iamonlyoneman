import { eq } from 'fp-ts'
import { Predicate, pipe } from 'fp-ts/function'
import { Lens as MonocleLens } from 'monocle-ts'

import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { KlkPostsQuery } from '../../shared/models/KlkPostsQuery'
import { Future, IO, List, Maybe, NonEmptyArray } from '../../shared/utils/fp'
import { StringUtils } from '../../shared/utils/StringUtils'
import { Config } from '../config/Config'
import { AxiosConfig } from '../models/AxiosConfig'
import { KlkPost } from '../models/KlkPost'
import { Link } from '../models/Link'
import { Listing } from '../models/Listing'
import { MsDuration } from '../models/MsDuration'
import { RedditSort } from '../models/RedditSort'
import { KlkPostPersistence } from '../persistence/KlkPostPersistence'
import { ProbeUtils } from '../utils/ProbeUtils'
import { ReducerAccumulator, ReducerReturn, reduceListing } from '../utils/reduceListing'
import { PartialLogger } from './Logger'

export type KlkPostService = ReturnType<typeof KlkPostService>

type FullPoll = {
  readonly fullPoll: boolean
}

type AllSort = {
  readonly allSort: boolean
}

type Counter = {
  readonly searches: number
  readonly postsFound: number
  readonly postsAlreadyInDb: number
  readonly postsInserted: number
}

namespace Counter {
  export const empty: Counter = {
    searches: 0,
    postsFound: 0,
    postsAlreadyInDb: 0,
    postsInserted: 0,
  }

  export function add(c1: Counter, c2: Counter): Counter {
    return {
      searches: c1.searches + c2.searches,
      postsFound: c1.postsFound + c2.postsFound,
      postsAlreadyInDb: c1.postsAlreadyInDb + c2.postsAlreadyInDb,
      postsInserted: c1.postsInserted + c2.postsInserted,
    }
  }

  export namespace Lens {
    export const searches = MonocleLens.fromPath<Counter>()(['searches'])
    export const postsFound = MonocleLens.fromPath<Counter>()(['postsFound'])
    export const postsAlreadyInDb = MonocleLens.fromPath<Counter>()(['postsAlreadyInDb'])
    export const postsInserted = MonocleLens.fromPath<Counter>()(['postsInserted'])
  }
}

const delayBetweenPolls = MsDuration.seconds(1)

const redditDotCom = 'https://reddit.com'
// const userAgent = 'browser:klk-iamonlyoneman:v1.0.0 (by /u/Grimalkin8675)'
const postHints = [undefined, 'image', 'link'] // for Link.post_hint
const iamonlyoneman: NonEmptyArray<string> = ['iamonlyoneman', 'iamonlyoneman_'] // for Link.author
const rKillLaKill = 'r/KillLaKill' // for Link.subreddit_name_prefixed
const searchLimit = 100
const defaultSort: RedditSort = 'new'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function KlkPostService(
  Logger: PartialLogger,
  config: Config,
  klkPostPersistence: KlkPostPersistence,
) {
  const logger = Logger('KlkPostService')

  return {
    fullPoll: fullPoll_,

    addMissingSize,

    initDbIfEmpty: (): Future<void> =>
      pipe(
        klkPostPersistence.count(),
        Future.chain(_ =>
          _ === 0 ? fullPoll_() : Future.fromIOEither(logger.info('Nothing to poll')),
        ),
      ),

    scheduleRedditPolling: (): Future<void> =>
      pipe(
        config.pollOnStart ? dailyPoll() : Future.unit,
        Future.chain(() => Future.fromIOEither(setRefreshActivityInterval())),
      ),

    findAll: (query: KlkPostsQuery, page: number): Future<List<KlkPost>> =>
      klkPostPersistence.findAll(query, page),

    updatePostAndGetUpdated: (id: KlkPostId, payload: KlkPostEditPayload): Future<Maybe<KlkPost>> =>
      pipe(
        klkPostPersistence.updatePostById(id, payload),
        Future.chain(ok => (ok ? klkPostPersistence.findById(id) : Future.right(Maybe.none))),
      ),
  }

  function setRefreshActivityInterval(): IO<void> {
    return pipe(
      IO.tryCatch(() =>
        setInterval(
          () => pipe(dailyPoll(), Future.runUnsafe),
          MsDuration.unwrap(config.pollEveryHours),
        ),
      ),
      Future.fromIOEither,
      Future.chain(() => dailyPoll()),
      Future.delay(config.pollEveryHours),
      IO.runFuture,
    )
  }

  function addMissingSize(): Future<void> {
    return pipe(
      klkPostPersistence.findWithEmptySize(),
      Future.chain(posts =>
        pipe(
          posts,
          List.map(post =>
            pipe(
              ProbeUtils.probeSize(post.url, logger),
              Future.chain(
                Maybe.fold(
                  () => Future.right(false),
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

  function dailyPoll(): Future<void> {
    return logPoll(uIamonlyonemanPoll({ fullPoll: false, allSort: false }))
  }

  function fullPoll_(): Future<void> {
    const opts = { fullPoll: true, allSort: true }
    return logPoll(
      reduceMultipleListing([
        rKillLaKillPoll(opts),
        uIamonlyonemanPoll(opts),
        rKillLaKillSearchPoll(opts),
      ]),
    )
  }

  function logPoll(f: Future<ReducerAccumulator<Counter>>): Future<void> {
    return pipe(
      Future.fromIOEither(logger.info('Start polling')),
      Future.chain(() => f),
      Future.chain(({ requestsCount, accumulator: c }) =>
        Future.fromIOEither(
          logger.info(
            `End polling - requests: ${requestsCount}, posts found: ${c.postsFound}, posts already in db: ${c.postsAlreadyInDb}, posts inserted: ${c.postsInserted}`,
          ),
        ),
      ),
    )
  }

  function rKillLaKillPoll({
    fullPoll,
    allSort,
  }: FullPoll & AllSort): Future<ReducerAccumulator<Counter>> {
    const reduce = allSort ? reduceForAllSorts : reduceOneListing

    return reduce(
      { fullPoll },
      {
        url: `${redditDotCom}/${rKillLaKill}.json`,
        params: { sort: defaultSort, limit: searchLimit.toString() },
      },
      l =>
        postHints.includes(l.data.post_hint) &&
        List.elem(eq.eqString)(l.data.author, iamonlyoneman),
    )
  }

  function uIamonlyonemanPoll({
    fullPoll,
    allSort,
  }: FullPoll & AllSort): Future<ReducerAccumulator<Counter>> {
    const reduce = allSort ? reduceForAllSorts : reduceOneListing

    return pipe(
      iamonlyoneman,
      List.map(author =>
        reduce(
          { fullPoll },
          {
            url: `${redditDotCom}/user/${author}/submitted.json`,
            params: { sort: defaultSort, limit: searchLimit.toString() },
          },
          l =>
            postHints.includes(l.data.post_hint) && l.data.subreddit_name_prefixed === rKillLaKill,
        ),
      ),
      reduceMultipleListing,
    )
  }

  function rKillLaKillSearchPoll({
    fullPoll,
    allSort,
  }: FullPoll & AllSort): Future<ReducerAccumulator<Counter>> {
    return pipe(
      iamonlyoneman,
      List.chain(author =>
        List.concat(
          // integers
          pipe(
            List.range(1, 9),
            List.map(n => rKillLaKillSearchEpisode({ fullPoll, allSort }, author, `${n}`)),
          ),
          // episodes
          pipe(
            List.range(1, 25),
            List.map(n =>
              rKillLaKillSearchEpisode({ fullPoll, allSort: false }, author, StringUtils.pad10(n)),
            ),
          ),
        ),
      ),
      reduceMultipleListing,
    )
  }

  function rKillLaKillSearchEpisode(
    { fullPoll, allSort }: FullPoll & AllSort,
    author: string,
    episode: string,
  ): Future<ReducerAccumulator<Counter>> {
    const reduce = allSort ? reduceForAllSorts : reduceOneListing

    return reduce(
      { fullPoll },
      {
        url: `${redditDotCom}/${rKillLaKill}/search.json`,
        params: {
          q: `author:${author} episode ${episode}`,
          t: 'all',
          show: 'all',
          include_over_18: 'on',
          restrict_sr: 'on',
          sort: defaultSort,
          limit: searchLimit.toString(),
        },
      },
      l => postHints.includes(l.data.post_hint),
    )
  }

  function reduceForAllSorts(
    fullPoll: FullPoll,
    config_: AxiosConfig,
    filter: Predicate<Link>,
  ): Future<ReducerAccumulator<Counter>> {
    return reduceMultipleListing(
      RedditSort.values.map(sort =>
        reduceOneListing(fullPoll, AxiosConfig.setParamSort(sort)(config_), filter),
      ),
    )
  }

  function reduceMultipleListing(
    futures: List<Future<ReducerAccumulator<Counter>>>,
  ): Future<ReducerAccumulator<Counter>> {
    return pipe(
      futures,
      List.reduce(Future.right(ReducerAccumulator.empty(Counter.empty)), (acc, f) =>
        pipe(
          acc,
          Future.delay(delayBetweenPolls),
          Future.chain(acc1 =>
            pipe(
              f,
              Future.map(acc2 => ReducerAccumulator.add(acc1, acc2, Counter.add)),
            ),
          ),
        ),
      ),
    )
  }

  function reduceOneListing(
    fullPoll: FullPoll,
    config_: AxiosConfig,
    filter: Predicate<Link>,
  ): Future<ReducerAccumulator<Counter>> {
    return reduceListing(logger, config_, Link.decoder, Counter.empty, (listing, { accumulator }) =>
      syncListing(fullPoll, listing, accumulator, filter),
    )
  }

  function syncListing(
    { fullPoll }: FullPoll,
    listing: Listing<Link>,
    counter: Counter,
    filter: Predicate<Link>,
  ): Future<ReducerReturn<Counter>> {
    return pipe(
      klkPostPersistence.findByIds(listing.data.children.map(_ => _.data.id)),
      Future.chain(inDb => {
        const filtered = listing.data.children.filter(filter)
        const { left: notInDb, right: alreadyInDb } = pipe(
          filtered,
          List.partition(link =>
            pipe(
              inDb,
              List.some(_ => _ === link.data.id),
            ),
          ),
        )
        const newCounter = pipe(
          counter,
          Counter.Lens.postsFound.modify(_ => _ + filtered.length),
          Counter.Lens.postsAlreadyInDb.modify(_ => _ + alreadyInDb.length),
        )
        return pipe(
          logger.debug('alreadyInDb:', printLinkIds(alreadyInDb)),
          IO.chain(() => logger.debug('    notInDb:', printLinkIds(notInDb))),
          Future.fromIOEither,
          Future.chain(() => probeSizeAndAddToDb(notInDb, newCounter)),
          Future.chain(newAcc => {
            const shouldContinue = fullPoll || List.isEmpty(alreadyInDb)
            return pipe(
              Future.right({ shouldContinue, accumulator: newAcc }),
              Future.delay(delayBetweenPolls),
            )
          }),
        )
      }),
    )
  }

  function probeSizeAndAddToDb(links: List<Link>, counter: Counter): Future<Counter> {
    if (List.isEmpty(links)) return Future.right(counter)

    return pipe(
      links,
      List.map(link => {
        const post = KlkPost.fromLink(link)
        return pipe(
          post.size,
          Maybe.fold(
            () =>
              pipe(
                ProbeUtils.probeSize(post.url, logger),
                Future.map(
                  Maybe.fold(
                    () => post,
                    size => KlkPost.Lens.size.set(Maybe.some(size))(post),
                  ),
                ),
              ),
            () => Future.right(post),
          ),
        )
      }),
      Future.sequenceSeqArray,
      Future.chain(posts => addToDb(posts, counter)),
    )
  }

  function addToDb(posts: List<KlkPost>, counter: Counter): Future<Counter> {
    return pipe(
      posts,
      List.chain(p =>
        pipe(
          [
            Maybe.isNone(p.episode) || Maybe.isNone(p.size)
              ? logger.warn('Title:', JSON.stringify(p.title))
              : null,
            Maybe.isNone(p.episode) ? logger.warn('  - empty episode') : null,
            Maybe.isNone(p.size) ? logger.warn('  - empty size') : null,
          ],
          List.filter((l: IO<void> | null): l is IO<void> => l !== null),
        ),
      ),
      IO.sequenceSeqArray,
      Future.fromIOEither,
      Future.chain(() => klkPostPersistence.insertMany(posts)),
      Future.chain(res =>
        pipe(
          res.insertedCount === posts.length
            ? Future.unit
            : Future.fromIOEither(
                logger.error('insertMany: insertedCount was different than inserted length'),
              ),
          Future.map(() => Counter.Lens.postsInserted.modify(_ => _ + res.insertedCount)(counter)),
        ),
      ),
    )
  }
}

function printLinkIds(links: List<Link>): string {
  const res = pipe(
    links.map(_ => KlkPostId.unwrap(_.data.id)),
    StringUtils.mkString(','),
  )
  return `(${links.length}) ${res}`
}
