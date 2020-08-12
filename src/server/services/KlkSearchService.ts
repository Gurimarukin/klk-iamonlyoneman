import Axios from 'axios'
import * as D from 'io-ts/lib/Decoder'

import { PartialLogger } from './Logger'
import { AxiRes } from '../models/AxiRes'
import { Link } from '../models/Link'
import { LinksListing } from '../models/LinksListing'
import { Listing } from '../models/Listing'
import { Future, pipe, Either, List, IO, flow } from '../../shared/utils/fp'

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
    requestWip: (): Future<void> =>
      pipe(
        request(),
        Future.chain(
          Either.fold(
            () => Future.right(undefined),
            _ => pipe(logger.debug('data:', _.data), Future.fromIOEither),
          ),
        ),
      ),
  }

  function request(after?: string): Future<Either<AxiRes, AxiRes<LinksListing>>> {
    const defaultParams = {
      q: 'author:iamonlyoneman',
      sort: 'new',
      t: 'all',
      show: 'all',
      limit: '100',
    }
    const params = after === undefined ? defaultParams : { ...defaultParams, after }
    return pipe(
      Future.apply(() => klkSearch.request<unknown>({ method: 'GET', params })),
      Future.chain<Error, AxiRes, Either<AxiRes, AxiRes<LinksListing>>>(res =>
        res.status === 200
          ? pipe(
              Listing.decoder.decode(res.data),
              Either.fold(
                e =>
                  pipe(
                    logger.error(`Couldn't parse Listing:\n${D.draw(e)}`),
                    IO.map(_ => Either.left(res)),
                  ),
                flow(
                  fromListing,
                  IO.map(data => Either.right({ ...res, data })),
                ),
              ),
              Future.fromIOEither,
            )
          : Future.right(Either.left(res)),
      ),
    )
  }

  function fromListing(listing: Listing): IO<LinksListing> {
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
}
