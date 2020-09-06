import * as D from 'io-ts/Decoder'

import { Either, Future, Try, flow } from '../../shared/utils/fp'

export namespace Http {
  export function get<A>(
    url: string,
    decode: (u: unknown) => Either<D.DecodeError, A>,
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
            decode,
            Either.fold(
              e => Promise.reject(D.draw(e)),
              a => Promise.resolve(Either.right(a)),
            ),
          ),
        )
        .catch(Either.left)
  }

  export function post<A, O, B>(
    url: string,
    data: A,
    encode: (a: A) => O,
    decode: (u: unknown) => Either<D.DecodeError, B>,
    config: RequestInit = {},
  ): Future<B> {
    const headers = {
      'Content-Type': 'application/json',
    }
    return () =>
      fetch(url, {
        method: 'POST',
        ...config,
        headers: {
          ...headers,
          ...config.headers,
        },
        body: JSON.stringify(encode(data)),
      })
        .then<unknown>(res => (res.ok ? res.json() : Promise.reject(res)))
        .then<Try<B>>(
          flow(
            decode,
            Either.fold(
              e => Promise.reject(D.draw(e)),
              a => Promise.resolve(Either.right(a)),
            ),
          ),
        )
        .catch(Either.left)
  }
}
