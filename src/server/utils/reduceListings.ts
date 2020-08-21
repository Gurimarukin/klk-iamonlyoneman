import { AxiosInstance, AxiosRequestConfig } from 'axios'
import * as D from 'io-ts/lib/Decoder'
import { Lens as MLens } from 'monocle-ts'
import querystring from 'querystring'

import { Dict, Either, Future, IO, List, Maybe, flow, pipe } from '../../shared/utils/fp'

import { StringUtils } from '../../shared/utils/StringUtils'

import { AxiRes } from '../models/AxiRes'
import { Listing, UnknownListing } from '../models/Listing'
import { Logger } from '../services/Logger'

namespace AxiosRequestConfig {
  export namespace Lens {
    export const after: MLens<AxiosRequestConfig, string> = MLens.fromPath<AxiosRequestConfig>()([
      'params',
      'after',
    ])

    export const count: MLens<AxiosRequestConfig, number> = MLens.fromPath<AxiosRequestConfig>()([
      'params',
      'count',
    ])
  }
}

export type ReducerAccumulator<A> = Readonly<{
  distCount: number
  requestsCount: number
  accumulator: A
}>

export namespace ReducerAccumulator {
  export function empty<A>(accumulator: A): ReducerAccumulator<A> {
    return { distCount: 0, requestsCount: 0, accumulator }
  }

  export function modify<A, K extends keyof ReducerAccumulator<A>>(
    key: K,
    update: (value: ReducerAccumulator<A>[K]) => ReducerAccumulator<A>[K],
  ): (r: ReducerAccumulator<A>) => ReducerAccumulator<A> {
    return r => ({ ...r, [key]: update(r[key]) })
  }
}

export type ReducerReturn<A> = Readonly<{
  shouldContinue: boolean
  accumulator: A
}>

// config.params.after and config.params.count will be overriden
export function reduceListings<A, B>(
  logger: Logger,
  axiosInstance: AxiosInstance,
  config: AxiosRequestConfig,
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
          Maybe.fold<Listing<A>, Future<ReducerAccumulator<B>>>(
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
      ReducerAccumulator.modify('accumulator', _ => newAcc),
    )
    return shouldContinue
      ? pipe(
          listing.data.after,
          Maybe.fold<string, Future<ReducerAccumulator<B>>>(
            () => Future.right(newReducerAcc),
            a => reduceRec(newReducerAcc, a),
          ),
        )
      : Future.right(newReducerAcc)
  }

  function fetchListing(after?: string, count = 0): Future<Maybe<Listing<A>>> {
    const newConfig = pipe(
      after === undefined ? config : AxiosRequestConfig.Lens.after.set(after)(config),
      AxiosRequestConfig.Lens.count.set(count),
    )
    return pipe(
      Future.apply(() => axiosInstance.request<unknown>(newConfig)),
      Future.chain(res =>
        pipe(
          Future.fromIOEither(logger.debug(printResponse(res))),
          Future.map(_ => res),
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
                IO.map(_ => Maybe.none),
              ),
            flow(decodeChildren, IO.map(Maybe.some)),
          ),
          Future.fromIOEither,
        )
      : pipe(
          logger.warn('Non 200 status:'),
          IO.chain(_ => logger.warn(printDetailedResponse(res))),
          IO.map(_ => Maybe.none),
          Future.fromIOEither,
        )
  }

  function decodeChildren(listing: UnknownListing): IO<Listing<A>> {
    return pipe(
      listing.data.children,
      List.reduceWithIndex<unknown, IO<A[]>>(IO.right([]), (i, ioAcc, child) =>
        pipe(
          ioAcc,
          IO.chain(acc =>
            pipe(
              decoder.decode(child),
              Either.fold(
                e =>
                  pipe(
                    logger.warn(`Couldn't parse child with index ${i}:\n${D.draw(e)}`),
                    IO.map(_ => acc),
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
    res.headers as Dict<string>,
    Dict.collect((key, val) => `${key}: ${val}`),
    StringUtils.mkString('\n'),
  )
  const data = JSON.stringify(res.data, null, 2)

  return StringUtils.stripMargins(
    `${status} ${statusText}
    |${headers}
    |
    |${data}`,
  )
}
