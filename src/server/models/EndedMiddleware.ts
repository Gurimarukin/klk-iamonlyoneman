import { pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'

import { Dict, unknownToError } from '../../shared/utils/fp'

export type EndedMiddleware = H.Middleware<H.StatusOpen, H.ResponseEnded, unknown, void>

export namespace EndedMiddleware {
  export function text(
    status: H.Status,
    headers: Dict<string, string> = {},
  ): (message?: string) => EndedMiddleware {
    return (message = '') =>
      pipe(
        reduceHeaders(status, headers),
        H.ichain(() => H.closeHeaders()),
        H.ichain(() => H.send(message)),
      )
  }

  export function json<A, O>(
    status: H.Status,
    encode: (a: A) => O,
    headers: Dict<string, string> = {},
  ): (data: A) => EndedMiddleware {
    return (data: A) =>
      pipe(
        reduceHeaders(status, headers),
        H.ichain(() => H.json(encode(data), unknownToError)),
        H.orElse(() => text(H.Status.InternalServerError)()),
      )
  }

  function reduceHeaders(
    status: H.Status,
    headers: Dict<string, string>,
  ): H.Middleware<H.StatusOpen, H.HeadersOpen, never, void> {
    return pipe(
      headers,
      Dict.reduceWithIndex(H.status(status), (key, acc, val) =>
        pipe(
          acc,
          H.ichain(() => H.header(key, val)),
        ),
      ),
    )
  }
}
