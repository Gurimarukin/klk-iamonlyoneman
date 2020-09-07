import express, { Request } from 'express'
import * as H from 'hyper-ts'
import { ExpressConnection, fromRequestHandler } from 'hyper-ts/lib/express'
import * as D from 'io-ts/Decoder'

import { Either, Future, IO, flow, pipe } from '../../shared/utils/fp'
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

  export const withJsonBody = <E, A>(decode: (i: unknown) => Either<E, A>) => (
    onRight: (a: A) => EndedMiddleware,
    onLeft: (e: E) => IO<void> = _ => IO.unit,
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
      H.ichain(
        flow(
          decode,
          Either.fold(
            e =>
              pipe(
                H.fromIOEither(onLeft(e)),
                H.ichain(_ => H.left(undefined as unknown)),
              ),
            a => H.right(a),
          ),
        ),
      ),
      H.ichain(onRight),
      H.orElse(_ => EndedMiddleware.text(H.Status.BadRequest)()),
    )

  export const withRequest: H.Middleware<H.StatusOpen, H.StatusOpen, unknown, Request> = (
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

  export const withParams = <A>(decoder: D.Decoder<unknown, A>) => (
    f: (a: A) => EndedMiddleware,
  ): EndedMiddleware =>
    pipe(
      H.decodeParams(decoder.decode),
      H.ichain(a => f(a)),
      H.orElse(_ => EndedMiddleware.text(H.Status.BadRequest)()),
    )

  export const notImplementedYet = EndedMiddleware.text(H.Status.InternalServerError)(
    'Not implemented yet',
  )
}
