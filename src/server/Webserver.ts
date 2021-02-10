import { Server } from 'http'

import express, { ErrorRequestHandler } from 'express'
import { flow, pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'
import { Action, ExpressConnection, toArray, toRequestHandler } from 'hyper-ts/lib/express'

import { Dict, Either, Future, IO, List, Maybe, NonEmptyArray, Task } from '../shared/utils/fp'
import { s } from '../shared/utils/StringUtils'
import { Config } from './config/Config'
import { EndedMiddleware } from './models/EndedMiddleware'
import { Route } from './models/Route'
import { Logger, PartialLogger } from './services/Logger'

const allowedHeaders = ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']

export const startWebServer = (
  Logger_: PartialLogger,
  config: Config,
  routes: List<Route>,
): IO<Server> => {
  const logger = Logger_('WebServer')

  const withCors = pipe(
    IO.tryCatch(() => express()),
    IO.chain(app =>
      pipe(
        config.allowedOrigins,
        Maybe.fold(
          () => IO.tryCatch(() => app),
          allowedOrigins =>
            IO.tryCatch(() =>
              app.use((req, res, next) =>
                pipe(
                  Dict.lookup('origin', req.headers),
                  Maybe.filter(containedIn(allowedOrigins)),
                  Maybe.fold(
                    () => next(),
                    origin => {
                      /* eslint-disable functional/no-expression-statement */
                      res.append('Access-Control-Allow-Origin', origin)
                      res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '))
                      if (req.method === 'OPTIONS') res.send()
                      else next()
                      /* eslint-enable functional/no-expression-statement */
                    },
                  ),
                ),
              ),
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
            app[method](path, pipe(middleware, withTry, withLog, toRequestHandler)),
          ),
        ),
      ),
    ),
    IO.chain(_ =>
      IO.tryCatch(() =>
        _.use(pipe(EndedMiddleware.text(H.Status.NotFound)(), withLog, toRequestHandler)),
      ),
    ),
    IO.chain(_ => IO.tryCatch(() => _.use(errorHandler(onError)))),
    IO.chain(_ =>
      IO.tryCatch(() =>
        _.listen(config.port, logger.info(s`Server listening on port ${config.port}`)),
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
                Task.chain(() => EndedMiddleware.text(H.Status.InternalServerError)()(conn)),
              ),
              Task.of,
            ),
          ),
        ),
      )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onError(error: any): IO<void> {
    return error.stack === undefined ? logger.error(error) : logger.error(error.stack)
  }
}

function containedIn<A>(allowedOrigins: NonEmptyArray<A>): <B>(elem: A | B) => elem is A {
  return (elem): elem is A =>
    pipe(
      allowedOrigins,
      List.some(_ => _ === elem),
    )
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

function errorHandler(onError: (error: unknown) => IO<unknown>): ErrorRequestHandler {
  return (err, _req, res) => {
    /* eslint-disable functional/no-expression-statement */
    onError(err)()
    res.status(500).end()
    /* eslint-enable functional/no-expression-statement */
  }
}
