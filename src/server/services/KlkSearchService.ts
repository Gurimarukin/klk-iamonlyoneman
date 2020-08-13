import Axios from 'axios'
import * as D from 'io-ts/lib/Decoder'
import querystring from 'querystring'

import { PartialLogger } from './Logger'
import { AxiRes } from '../models/AxiRes'
import { Link } from '../models/Link'
import { LinksListing } from '../models/LinksListing'
import { Listing } from '../models/Listing'
import { Future, pipe, Either, List, IO, flow, Dict, Maybe } from '../../shared/utils/fp'
import { StringUtils } from '../../shared/utils/StringUtils'

export type KlkSearchService = ReturnType<typeof KlkSearchService>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkSearchService(Logger: PartialLogger) {
  const logger = Logger('KlkSearchService')

  const klkSearch = Axios.create({
    url: 'https://www.reddit.com/r/KillLaKill/search.json',
    headers: {
      'User-Agent': 'browser:klk-iamonlyoneman:v1.0.0 (by /u/Grimalkin8675)',
    },
  })

  return {
    search: (after?: string): Future<Maybe<LinksListing>> =>
      pipe(
        request(after),
        Future.chain<Error, AxiRes, Maybe<LinksListing>>(res =>
          res.status === 200
            ? pipe(
                Listing.decoder.decode(res.data),
                Either.fold(
                  e =>
                    pipe(
                      logger.error(`Couldn't parse Listing:\n${D.draw(e)}`),
                      IO.map(_ => Maybe.none),
                    ),
                  flow(linksListing, IO.map(Maybe.some)),
                ),
                Future.fromIOEither,
              )
            : pipe(
                logger.warn('Non 200 status:'),
                IO.chain(_ => logger.warn(printDetailedResponse(res))),
                IO.map(_ => Maybe.none),
                Future.fromIOEither,
              ),
        ),
      ),
  }

  function request(after?: string): Future<AxiRes> {
    const defaultParams = {
      q: 'author:iamonlyoneman',
      sort: 'new',
      t: 'all',
      show: 'all',
      restrict_sr: 'on',
      limit: '100',
    }
    const params = after === undefined ? defaultParams : { ...defaultParams, after }
    return pipe(
      Future.apply(() => klkSearch.request<unknown>({ method: 'GET', params })),
      Future.chain(res =>
        pipe(
          Future.fromIOEither(logger.debug(printResponse(res))),
          Future.map(_ => res),
        ),
      ),
    )
  }

  function linksListing(listing: Listing): IO<LinksListing> {
    return pipe(
      listing.data.children,
      List.reduceWithIndex<unknown, IO<Link[]>>(IO.right([]), (i, ioAcc, child) =>
        pipe(
          ioAcc,
          IO.chain(acc =>
            pipe(
              Link.decoder.decode(child),
              Either.fold(
                e =>
                  pipe(
                    logger.warn(`Couldn't parse child with index ${i}:\n${D.draw(e)}`),
                    IO.map(_ => acc),
                  ),
                _ => IO.right(List.snoc(acc, _)),
              ),
            ),
          ),
        ),
      ),
      IO.map(children => ({ ...listing, data: { ...listing.data, children } })),
    )
  }

  function printResponse<A>(res: AxiRes<A>): string {
    const {
      status,
      config: { method, url },
    } = res
    const params = querystring.stringify(res.config.params)

    return `${method.toUpperCase()} ${url}?${params} ${status}`
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
}
