import { Predicate } from 'fp-ts/lib/function'
import { Lens as MonocleLens } from 'monocle-ts'

import { Do, Future, IO, List, Maybe, Task, pipe } from '../../shared/utils/fp'

import { KlkPost } from '../../shared/models/klkPost/KlkPost'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Size } from '../../shared/models/klkPost/Size'
import { StringUtils } from '../../shared/utils/StringUtils'

import { PartialLogger } from './Logger'
import { AxiosConfig } from '../models/AxiosConfig'
import { Link } from '../models/Link'
import { Listing } from '../models/Listing'
import { RedditSort } from '../models/RedditSort'
import { KlkPostPersistence } from '../persistence/KlkPostPersistence'
import { ProbeUtils } from '../utils/ProbeUtils'
import { ReducerAccumulator, ReducerReturn, reduceListing } from '../utils/reduceListing'
import { Config } from '../config/Config'

export type KlkPostService = ReturnType<typeof KlkPostService>

type FullPoll = Readonly<{
  fullPoll: boolean
}>

type AllSort = Readonly<{
  allSort: boolean
}>

type Counter = Readonly<{
  searches: number
  postsFound: number
  postsAlreadyInDb: number
  postsInserted: number
}>

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

const pollRedditEvery = 24 * 60 * 60 * 1000 // ms

const delayBetweenPolls = 1000 // ms

const redditDotCom = 'https://reddit.com'
// const userAgent = 'browser:klk-iamonlyoneman:v1.0.0 (by /u/Grimalkin8675)'
const postHint = 'image' // for Link.post_hint
const iamonlyoneman = 'iamonlyoneman' // for Link.author
const rKillLaKill = 'r/KillLaKill' // for Link.subreddit_name_prefixed
const searchLimit = 100
const defaultSort: RedditSort = 'new'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostService(
  Logger: PartialLogger,
  config: Config,
  klkPostPersistence: KlkPostPersistence,
) {
  const logger = Logger('KlkPostService')

  return {
    fullPoll,

    addMissingSize,

    initDbIfEmpty: (): Future<void> =>
      pipe(
        klkPostPersistence.count(),
        Future.chain(_ =>
          _ === 0 ? fullPoll() : Future.fromIOEither(logger.info('Nothing to poll')),
        ),
      ),

    scheduleRedditPolling: (): Future<void> =>
      pipe(
        config.isDev
          ? pipe(
              dailyPoll(),
              Future.map(_ => {}),
            )
          : Future.unit,
        Future.chain(_ => Future.fromIOEither(setRefreshActivityInterval())),
      ),

    findAll: (): Future<KlkPost[]> => klkPostPersistence.findAll(),
  }

  function setRefreshActivityInterval(): IO<void> {
    const now = new Date()
    const tomorrow8am = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8)
    const untilTomorrow8am = new Date(tomorrow8am.getTime() - now.getTime())
    return pipe(
      logger.info(
        `Scheduling poll: 8am is in ${padded(untilTomorrow8am.getHours())}h${padded(
          untilTomorrow8am.getMinutes(),
        )}`,
      ),
      IO.chain(_ =>
        IO.apply(() => setInterval(() => pipe(dailyPoll(), Future.runUnsafe), pollRedditEvery)),
      ),
      Future.fromIOEither,
      Task.delay(untilTomorrow8am.getTime()),
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
          List.array.sequence(Future.taskEitherSeq),
        ),
      ),
      Future.chain(res =>
        Future.fromIOEither(
          logger.info(`Added missing sizes: ${res.filter(s => s).length}/${res.length}`),
        ),
      ),
    )
  }

  function dailyPoll(): Future<ReducerAccumulator<Counter>> {
    return uIamonlyonemanPoll({ fullPoll: false, allSort: false })
  }

  function fullPoll(): Future<void> {
    const opts = { fullPoll: true, allSort: true }
    return pipe(
      Future.fromIOEither(logger.info('Start polling')),
      Future.chain(_ => reduceMultipleListing([rKillLaKillPoll(opts), uIamonlyonemanPoll(opts)])),
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
        params: {
          sort: defaultSort,
          limit: searchLimit.toString(),
        },
      },
      l => l.data.post_hint === postHint && l.data.author === iamonlyoneman,
    )
  }

  function uIamonlyonemanPoll({
    fullPoll,
    allSort,
  }: FullPoll & AllSort): Future<ReducerAccumulator<Counter>> {
    const reduce = allSort ? reduceForAllSorts : reduceOneListing

    return reduce(
      { fullPoll },
      {
        url: `${redditDotCom}/user/${iamonlyoneman}/submitted.json`,
        params: {
          sort: defaultSort,
          limit: searchLimit.toString(),
        },
      },
      l => l.data.post_hint === postHint && l.data.subreddit_name_prefixed === rKillLaKill,
    )
  }

  function _rKillLaKillSearchPoll({
    fullPoll,
    allSort,
  }: FullPoll & AllSort): Future<ReducerAccumulator<Counter>> {
    const reduce = allSort ? reduceForAllSorts : reduceOneListing

    return reduce(
      { fullPoll },
      {
        url: `${redditDotCom}/${rKillLaKill}/search.json`,
        params: {
          q: `author:${iamonlyoneman}`,
          t: 'all',
          show: 'all',
          include_over_18: 'on',
          restrict_sr: 'on',
          sort: defaultSort,
          limit: searchLimit.toString(),
        },
      },
      l => l.data.post_hint === postHint,
    )
  }

  function reduceForAllSorts(
    fullPoll: FullPoll,
    config: AxiosConfig,
    filter: Predicate<Link>,
  ): Future<ReducerAccumulator<Counter>> {
    return reduceMultipleListing(
      RedditSort.values.map(sort =>
        reduceOneListing(fullPoll, AxiosConfig.setParamSort(sort)(config), filter),
      ),
    )
  }

  function reduceMultipleListing(
    futures: Future<ReducerAccumulator<Counter>>[],
  ): Future<ReducerAccumulator<Counter>> {
    return pipe(
      futures,
      List.reduce(Future.right(ReducerAccumulator.empty(Counter.empty)), (acc, f) =>
        pipe(
          acc,
          Task.delay(delayBetweenPolls),
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
    config: AxiosConfig,
    filter: Predicate<Link>,
  ): Future<ReducerAccumulator<Counter>> {
    return reduceListing(logger, config, Link.decoder, Counter.empty, (listing, { accumulator }) =>
      syncListingBis(fullPoll, listing, accumulator, filter),
    )
  }

  function syncListingBis(
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
              List.exists(_ => _ === link.data.id),
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
          IO.chain(_ => logger.debug('    notInDb:', printLinkIds(notInDb))),
          Future.fromIOEither,
          Future.chain(_ => probeSizeAndAddToDb(notInDb, newCounter)),
          Future.chain(newAcc => {
            const shouldContinue = fullPoll || List.isEmpty(alreadyInDb)
            return pipe(
              Future.right({ shouldContinue, accumulator: newAcc }),
              Task.delay(delayBetweenPolls),
            )
          }),
        )
      }),
    )
  }

  function probeSizeAndAddToDb(links: Link[], counter: Counter): Future<Counter> {
    if (List.isEmpty(links)) return Future.right(counter)

    return pipe(
      links,
      List.map(link => {
        const post = klkPostFromLink(link)
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
            _ => Future.right(post),
          ),
        )
      }),
      List.sequence(Future.taskEitherSeq),
      Future.chain(posts => addToDb(posts, counter)),
    )
  }

  function addToDb(posts: KlkPost[], counter: Counter): Future<Counter> {
    return pipe(
      List.sequence(IO.ioEither)(
        pipe(
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
          Future.map(_ => Counter.Lens.postsInserted.modify(_ => _ + res.insertedCount)(counter)),
        ),
      ),
    )
  }
}

function klkPostFromLink(l: Link): KlkPost {
  const { episode, size } = metadataFromTitle(l.data.title)
  return {
    id: l.data.id,
    title: l.data.title,
    episode,
    size,
    createdAt: new Date(l.data.created_utc * 1000),
    permalink: l.data.permalink,
    url: l.data.url,
  }
}

type Metadata = Readonly<{
  episode: Maybe<number>
  size: Maybe<Size>
}>

const Regex = {
  episode: /eps?is?ode\s+([0-9]+)/i,
  size: /([0-9]+)\s*[x\*]\s*([0-9]+)/i,
}

export function metadataFromTitle(title: string): Metadata {
  const episode = pipe(title, StringUtils.matcher1(Regex.episode), Maybe.chain(toNumber))
  const size = pipe(
    title,
    StringUtils.matcher2(Regex.size),
    Maybe.chain(([width, height]) =>
      Do(Maybe.option)
        .bindL('width', () => toNumber(width))
        .bindL('height', () => toNumber(height))
        .done(),
    ),
  )
  return { episode, size }
}

function toNumber(str: string): Maybe<number> {
  const n = Number(str.trim())
  return isNaN(n) ? Maybe.none : Maybe.some(n)
}

function printLinkIds(links: Link[]): string {
  const res = pipe(
    links.map(_ => KlkPostId.unwrap(_.data.id)),
    StringUtils.mkString(','),
  )
  return `(${links.length}) ${res}`
}

function padded(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}
