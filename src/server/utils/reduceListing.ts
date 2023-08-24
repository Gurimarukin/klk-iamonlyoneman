import querystring from 'querystring'

import Axios, { AxiosRequestConfig } from 'axios'
import { flow, pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { Dict, Either, Future, IO, List, Maybe } from '../../shared/utils/fp'
import { StringUtils } from '../../shared/utils/StringUtils'
import { AxiosConfig } from '../models/AxiosConfig'
import { AxiRes } from '../models/AxiRes'
import { Listing, UnknownListing } from '../models/Listing'
import { Logger } from '../services/Logger'

export type ReducerAccumulator<A> = {
  readonly requestsCount: number
  readonly distCount: number
  readonly accumulator: A
}

export namespace ReducerAccumulator {
  export function empty<A>(accumulator: A): ReducerAccumulator<A> {
    return { distCount: 0, requestsCount: 0, accumulator }
  }

  export function add<A>(
    acc1: ReducerAccumulator<A>,
    acc2: ReducerAccumulator<A>,
    addA: (a1: A, a2: A) => A,
  ): ReducerAccumulator<A> {
    return {
      requestsCount: acc1.requestsCount + acc2.requestsCount,
      distCount: acc1.distCount + acc2.distCount,
      accumulator: addA(acc1.accumulator, acc2.accumulator),
    }
  }

  export function modify<A, K extends keyof ReducerAccumulator<A>>(
    key: K,
    update: (value: ReducerAccumulator<A>[K]) => ReducerAccumulator<A>[K],
  ): (r: ReducerAccumulator<A>) => ReducerAccumulator<A> {
    return r => ({ ...r, [key]: update(r[key]) })
  }
}

export type ReducerReturn<A> = {
  readonly shouldContinue: boolean
  readonly accumulator: A
}

// config.params.after and config.params.count will be overriden
export function reduceListing<A, B>(
  logger: Logger,
  config: AxiosConfig,
  decoder: D.Decoder<unknown, A>,
  emptyAccumulator: B,
  foreachListing: (l: Listing<A>, reducerAcc: ReducerAccumulator<B>) => Future<ReducerReturn<B>>,
): Future<ReducerAccumulator<B>> {
  return reduceRec(ReducerAccumulator.empty(emptyAccumulator))

  function reduceRec(
    reducerAcc: ReducerAccumulator<B>,
    after?: string,
  ): Future<ReducerAccumulator<B>> {
    return pipe(
      fetchListing(after, reducerAcc.distCount),
      Future.chain(maybe => {
        const newReducerAcc = pipe(
          reducerAcc,
          ReducerAccumulator.modify('requestsCount', c => c + 1),
        )
        return pipe(
          maybe,
          Maybe.fold(
            () => Future.right(newReducerAcc),
            l => foreachListingAndContinue(newReducerAcc, l),
          ),
        )
      }),
    )
  }

  function foreachListingAndContinue(
    reducerAcc: ReducerAccumulator<B>,
    listing: Listing<A>,
  ): Future<ReducerAccumulator<B>> {
    return pipe(
      foreachListing(listing, reducerAcc),
      Future.chain(r => {
        const newReducerAcc = pipe(
          reducerAcc,
          ReducerAccumulator.modify('distCount', c => c + listing.data.dist),
        )
        return continueIfAfterDefined(newReducerAcc, listing, r)
      }),
    )
  }

  function continueIfAfterDefined(
    reducerAcc: ReducerAccumulator<B>,
    listing: Listing<A>,
    { shouldContinue, accumulator: newAcc }: ReducerReturn<B>,
  ): Future<ReducerAccumulator<B>> {
    const newReducerAcc = pipe(
      reducerAcc,
      ReducerAccumulator.modify('accumulator', () => newAcc),
    )
    return shouldContinue
      ? pipe(
          listing.data.after,
          Maybe.fold(
            () => Future.right(newReducerAcc),
            a => reduceRec(newReducerAcc, a),
          ),
        )
      : Future.right(newReducerAcc)
  }

  function fetchListing(after?: string, count = 0): Future<Maybe<Listing<A>>> {
    const newConfig = pipe(
      after === undefined ? config : AxiosConfig.setParam('after', after)(config),
      AxiosConfig.setParam('count', count.toString()),
    )
    return pipe(
      Future.tryCatch(() => Axios.request<unknown>(newConfig as AxiosRequestConfig)),
      Future.chain(res =>
        pipe(
          Future.fromIOEither(logger.debug(printResponse(res))),
          Future.map(() => res),
        ),
      ),
      Future.chain(decodeResIfOk),
    )
  }

  function decodeResIfOk(res: AxiRes): Future<Maybe<Listing<A>>> {
    return res.status === 200
      ? pipe(
          UnknownListing.decoder.decode(res.data),
          Either.fold(
            e =>
              pipe(
                logger.error(`Couldn't parse Listing:\n${D.draw(e)}`),
                IO.map(() => Maybe.none),
              ),
            flow(decodeChildren, IO.map(Maybe.some)),
          ),
          Future.fromIOEither,
        )
      : pipe(
          logger.warn('Non 200 status:'),
          IO.chain(() => logger.warn(printDetailedResponse(res))),
          IO.map(() => Maybe.none),
          Future.fromIOEither,
        )
  }

  function decodeChildren(listing: UnknownListing): IO<Listing<A>> {
    return pipe(
      listing.data.children,
      List.reduceWithIndex<unknown, IO<List<A>>>(IO.right([]), (i, ioAcc, child) =>
        pipe(
          ioAcc,
          IO.chain(acc =>
            pipe(
              decoder.decode(child),
              Either.fold(
                e =>
                  pipe(
                    logger.warn(`Couldn't parse child with index ${i}:\n${D.draw(e)}`),
                    IO.map(() => acc),
                  ),
                a => IO.right(List.snoc(acc, a)),
              ),
            ),
          ),
        ),
      ),
      IO.map(children => ({ ...listing, data: { ...listing.data, children } })),
    )
  }
}

function printResponse<A>(res: AxiRes<A>): string {
  const {
    status,
    config: { method, url },
  } = res
  const params = querystring.stringify(res.config.params)
  return `${method?.toUpperCase()} ${url}?${params} ${status}`
}

function printDetailedResponse<A>(res: AxiRes<A>): string {
  const { status, statusText } = res
  const headers = pipe(
    res.headers as Dict<string, string>,
    Dict.collect((key, val) => `${key}: ${val}`),
    List.mkString('\n'),
  )
  const data = JSON.stringify(res.data, null, 2)

  return StringUtils.stripMargins(
    `${status} ${statusText}
     |${headers}
     |
     |${data}`,
  )
}
