import express, { Request } from 'express'
import * as H from 'hyper-ts'
import { ExpressConnection, fromRequestHandler } from 'hyper-ts/lib/express'
import * as D from 'io-ts/Decoder'

import { Either, Future, IO, pipe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'

export namespace ControllerUtils {
  const stringBody: express.RequestHandler = (req, _res, next) => {
    let body = ''
    req.on('data', chunk => (body += chunk.toString()))
    req.on('end', () => {
      req.body = body
      next()
    })
  }

  export const withJsonBody = <A>(decode: (i: unknown) => Either<unknown, A>) => (
    onRight: (a: A) => EndedMiddleware,
  ): EndedMiddleware =>
    pipe(
      fromRequestHandler(stringBody, req => req.body as string),
      H.ichain(body =>
        pipe(
          H.decodeHeader('Content-Type', D.string.decode),
          H.filterOrElse<unknown, string>(
            contentType => contentType === 'application/json',
            _ => undefined,
          ),
          H.ichain(_ => H.fromEither(Either.parseJSON<unknown>(body, _ => undefined))),
        ),
      ),
      H.ichain(parsed => H.fromEither(decode(parsed))),
      H.ichain(onRight),
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
      H.decodeQuery(decode),
      H.ichain(onRight),
      H.orElse(e =>
        pipe(
          H.fromIOEither(onLeft(e as E)),
          H.ichain(_ => EndedMiddleware.text(H.Status.BadRequest)()),
        ),
      ),
    )

  export const notImplementedYet = EndedMiddleware.text(H.Status.InternalServerError)(
    'Not implemented yet',
  )
}
