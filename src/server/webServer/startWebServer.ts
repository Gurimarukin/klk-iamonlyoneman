import express, { ErrorRequestHandler } from 'express'
import { toArray } from 'fp-ts-contrib/List'
import { flow, identity, pipe } from 'fp-ts/function'
import type * as http from 'http'
import * as H from 'hyper-ts'
import { Action, ExpressConnection } from 'hyper-ts/lib/express'

import { Dict, Either, Future, IO, List, Maybe, Task } from '../../shared/utils/fp'

import { Config } from '../Config'
import { Logger, PartialLogger } from '../services/Logger'
import { EndedMiddleware, MyMiddleware as M } from './models/MyMiddleware'
import { Route } from './models/Route'

const accessControl = {
  allowCredentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposeHeaders: ['Set-Cookie'],
}

type Header = string | string[] | undefined

export const startWebServer = (
  Logger: PartialLogger,
  config: Config,
  routes: List<Route>,
): IO<http.Server> => {
  const logger = Logger('WebServer')

  const filterOrigin: (fa: Maybe<Header>) => Maybe<Header> = pipe(
    config.allowedOrigins,
    Maybe.fold(
      () => identity,
      allowedOrigins =>
        Maybe.filter(origin =>
          pipe(
            allowedOrigins,
            List.some(allowedOrigin => allowedOrigin.origin === origin),
          ),
        ),
    ),
  )

  const withCors: IO<express.Express> = pipe(
    IO.tryCatch(() => express()),
    IO.chain(app =>
      IO.tryCatch(() =>
        app.use((req, res, next) =>
          pipe(
            req.headers,
            Dict.lookup('origin'),
            u => filterOrigin(u),
            Maybe.fold(next, origin => {
              /* eslint-disable functional/no-expression-statements */
              res.header({
                'Access-Control-Allow-Origin': origin,
                ...(accessControl.allowCredentials
                  ? { 'Access-Control-Allow-Credentials': true }
                  : {}),
                'Access-Control-Expose-Headers': headers(accessControl.exposeHeaders),
              })
              if (req.method === 'OPTIONS') {
                res
                  .header({
                    'Access-Control-Allow-Methods': headers(accessControl.allowMethods),
                    'Access-Control-Allow-Headers': headers(accessControl.allowHeaders),
                  })
                  .send()
              } else {
                next()
              }
              /* eslint-enable functional/no-expression-statements */
            }),
          ),
        ),
      ),
    ),
  )

  return pipe(
    routes,
    List.reduce(withCors, (ioApp, [method, path, middleware]) =>
      pipe(
        ioApp,
        IO.chain(app =>
          IO.tryCatch(() =>
            app[method](path, pipe(middleware, withTry, withLog, M.toRequestHandler)),
          ),
        ),
      ),
    ),
    IO.chain(_ =>
      IO.tryCatch(() =>
        _.use(pipe(M.sendWithStatus(H.Status.NotFound)(''), withLog, M.toRequestHandler)),
      ),
    ),
    IO.chain(_ => IO.tryCatch(() => _.use(errorHandler(onError)))),
    IO.chain(_ =>
      IO.tryCatch(() =>
        _.listen(config.port, logger.info(`Server listening on port ${config.port}`)),
      ),
    ),
  )

  function withLog(middleware: EndedMiddleware): EndedMiddleware {
    return conn =>
      pipe(
        Task.Do,
        Task.bind('res', () => middleware(conn)),
        Task.chain(({ res }) =>
          pipe(
            res,
            Either.fold(
              () => Task.of(undefined),
              ([, _]) => logConnection(logger, _ as ExpressConnection<H.ResponseEnded>),
            ),
            Task.map(() => res),
          ),
        ),
      )
  }

  function withTry(middleware: EndedMiddleware): EndedMiddleware {
    return conn =>
      pipe(
        Future.tryCatch(() => middleware(conn)()),
        Task.chain(_ =>
          pipe(
            _,
            Either.fold(
              flow(
                onError,
                Task.fromIO,
                Task.chain(() => M.sendWithStatus(H.Status.InternalServerError)('')(conn)),
              ),
              Task.of,
            ),
          ),
        ),
      )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onError(error: any): IO<void> {
    return logger.error(error.stack === undefined ? error : error.stack)
  }
}

function logConnection(logger: Logger, conn: ExpressConnection<H.ResponseEnded>): Task<unknown> {
  const method = conn.getMethod()
  const uri = conn.getOriginalUrl()
  const status = pipe(
    conn,
    getStatus,
    Maybe.fold(
      () => [],
      _ => [_.toString()],
    ),
  )
  return Task.fromIO(logger.debug(method, uri, '-', ...status))
}

function getStatus(conn: ExpressConnection<H.ResponseEnded>): Maybe<H.Status> {
  return pipe(
    toArray(conn.actions),
    List.findLast(isStatus),
    Maybe.map(_ => _.status),
  )
}

function isStatus(a: Action): a is { readonly type: 'setStatus'; readonly status: H.Status } {
  return a.type === 'setStatus'
}

const errorHandler = (onError: (error: unknown) => IO<unknown>): ErrorRequestHandler => (
  err,
  _req,
  res,
) => {
  /* eslint-disable functional/no-expression-statements */
  onError(err)()
  res.status(500).end()
  /* eslint-enable functional/no-expression-statements */
}

const headers = (values: List<string>): string => pipe(values, List.mkString(', '))
