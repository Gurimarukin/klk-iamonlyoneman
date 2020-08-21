import * as H from 'hyper-ts'

import { Dict, pipe, unknownToError } from '../../shared/utils/fp'

export type EndedMiddleware = H.Middleware<H.StatusOpen, H.ResponseEnded, unknown, void>

export namespace EndedMiddleware {
  export function text(
    status: H.Status,
  ): (message?: string, headers?: Dict<string>) => EndedMiddleware {
    return (message = '', headers: Dict<string> = {}) =>
      pipe(
        reduceHeaders(status, headers),
        H.ichain(_ => H.closeHeaders()),
        H.ichain(_ => H.send(message)),
      )
  }

  export function json<A>(status: H.Status): (data: A, headers?: Dict<string>) => EndedMiddleware {
    return (data: A, headers: Dict<string> = {}) =>
      pipe(
        reduceHeaders(status, headers),
        H.ichain(_ => H.json(data, unknownToError)),
        H.orElse(_ => text(H.Status.InternalServerError)()),
      )
  }

  function reduceHeaders(
    status: H.Status,
    headers: Dict<string>,
  ): H.Middleware<H.StatusOpen, H.HeadersOpen, never, void> {
    return pipe(
      headers,
      Dict.reduceWithIndex(H.status(status), (key, acc, val) =>
        pipe(
          acc,
          H.ichain(_ => H.header(key, val)),
        ),
      ),
    )
  }
}
