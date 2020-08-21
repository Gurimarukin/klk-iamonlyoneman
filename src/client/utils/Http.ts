import * as D from 'io-ts/lib/Decoder'

import { Either, Future, Try, flow } from '../../shared/utils/fp'

export namespace Http {
  export function get<A>(
    url: string,
    decoder: (u: unknown) => Either<D.DecodeError, A>,
    config: RequestInit = {},
  ): Future<A> {
    const headers = {}

    return () =>
      fetch(url, {
        method: 'GET',
        ...config,
        headers: {
          ...headers,
          ...config.headers,
        },
      })
        .then<unknown>(res => (res.ok ? res.json() : Promise.reject(res)))
        .then<Try<A>>(
          flow(
            decoder,
            Either.fold(
              _ => Promise.reject(D.draw(_)),
              _ => Promise.resolve(Either.right(_)),
            ),
          ),
        )
        .catch(Either.left)
  }
}
