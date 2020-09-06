import express, { Request } from 'express'
import * as H from 'hyper-ts'
import { ExpressConnection, fromRequestHandler } from 'hyper-ts/lib/express'

import { Either, Future, IO, pipe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'

export namespace ControllerUtils {
  export const withJsonBody = <A>(decoder: (u: unknown) => Either<unknown, A>) => (
    f: (a: A) => EndedMiddleware,
  ): EndedMiddleware =>
    pipe(
      fromRequestHandler(express.json(), _ => undefined),
      H.ichain(_ => H.decodeBody(decoder)),
      H.ichain(f),
      H.orElse(_ => EndedMiddleware.text(H.Status.BadRequest)()),
    )

  export const withRequest: H.Middleware<H.StatusOpen, H.StatusOpen, Error, Request> = (
    conn: H.Connection<H.StatusOpen>,
  ) => Future.right([(conn as ExpressConnection<H.StatusOpen>).req, conn])

  export const withQuery = <E, A>(decode: (i: unknown) => Either<E, A>) => (
    onRight: (a: A) => EndedMiddleware,
    onLeft: (e: E) => IO<void> = _ => IO.unit,
  ): EndedMiddleware =>
    pipe(
      withRequest,
      H.ichain(req =>
        pipe(
          decode(req.query),
          Either.fold(
            e =>
              pipe(
                H.fromIOEither(onLeft(e)),
                H.ichain(_ => EndedMiddleware.text(H.Status.BadRequest)('Invalid query')),
              ),
            onRight,
          ),
        ),
      ),
    )

  export const notImplementedYet = EndedMiddleware.text(H.Status.InternalServerError)(
    'Not implemented yet',
  )
}
