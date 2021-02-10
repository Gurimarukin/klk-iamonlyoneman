import express from 'express'
import { flow, pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'
import { ExpressConnection, fromRequestHandler } from 'hyper-ts/lib/express'
import * as D from 'io-ts/Decoder'

import { Either, Future, IO } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'

export namespace ControllerUtils {
  const stringBody: express.RequestHandler = (req, _res, next) => {
    // eslint-disable-next-line functional/no-let
    let body = ''
    /* eslint-disable functional/no-expression-statement */
    req.on('data', chunk => (body += chunk.toString()))
    req.on('end', () => {
      // eslint-disable-next-line functional/immutable-data
      req.body = body
      next()
    })
    /* eslint-enable functional/no-expression-statement */
  }

  export const withJsonBody = <E, A>(decode: (i: unknown) => Either<E, A>) => (
    onRight: (a: A) => EndedMiddleware,
    onLeft: (e: E) => IO<void> = () => IO.unit,
  ): EndedMiddleware =>
    pipe(
      fromRequestHandler(stringBody, req => req.body as string),
      H.ichain(body =>
        pipe(
          H.decodeHeader('Content-Type', D.string.decode),
          H.filterOrElse<unknown, string>(
            contentType => contentType === 'application/json',
            () => undefined,
          ),
          H.ichain(() => H.fromEither(Either.parseJSON<unknown>(body, () => undefined))),
        ),
      ),
      H.ichain(
        flow(
          decode,
          Either.fold(
            e =>
              pipe(
                H.fromIOEither(onLeft(e)),
                H.ichain(() => H.left(undefined as unknown)),
              ),
            a => H.right(a),
          ),
        ),
      ),
      H.ichain(onRight),
      H.orElse(() => EndedMiddleware.text(H.Status.BadRequest)()),
    )

  export const withRequest: H.Middleware<H.StatusOpen, H.StatusOpen, unknown, express.Request> = (
    conn: H.Connection<H.StatusOpen>,
  ) => Future.right([(conn as ExpressConnection<H.StatusOpen>).req, conn])

  export const withQuery = <E, A>(decode: (i: unknown) => Either<E, A>) => (
    onRight: (a: A) => EndedMiddleware,
    onLeft: (e: E) => IO<void> = () => IO.unit,
  ): EndedMiddleware =>
    pipe(
      H.decodeQuery(decode),
      H.ichain(onRight),
      H.orElse(e =>
        pipe(
          H.fromIOEither(onLeft(e as E)),
          H.ichain(() => EndedMiddleware.text(H.Status.BadRequest)()),
        ),
      ),
    )

  export const withParams = <A>(decoder: D.Decoder<unknown, A>) => (
    f: (a: A) => EndedMiddleware,
  ): EndedMiddleware =>
    pipe(
      H.decodeParams(decoder.decode),
      H.ichain(a => f(a)),
      H.orElse(() => EndedMiddleware.text(H.Status.BadRequest)()),
    )

  export const notImplementedYet = EndedMiddleware.text(H.Status.InternalServerError)(
    'Not implemented yet',
  )
}
