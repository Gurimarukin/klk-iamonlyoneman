import express, { Request } from 'express'
import * as H from 'hyper-ts'
import { ExpressConnection, fromRequestHandler } from 'hyper-ts/lib/express'

import { Either, Future, pipe } from '../../shared/utils/fp'

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
}
