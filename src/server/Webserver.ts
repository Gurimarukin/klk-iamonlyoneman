import express, { ErrorRequestHandler } from 'express'
import * as H from 'hyper-ts'
import { toRequestHandler, ExpressConnection, toArray, Action } from 'hyper-ts/lib/express'
import { Server } from 'http'

import {
  Do,
  pipe,
  IO,
  Task,
  Either,
  List,
  Maybe,
  Future,
  NonEmptyArray,
  Dict,
  flow,
} from '../shared/utils/fp'

import { Config } from './config/Config'
import { EndedMiddleware } from './models/EndedMiddleware'
import { Route } from './models/Route'
import { PartialLogger, Logger } from './services/Logger'

export const startWebServer = (
  Logger: PartialLogger,
  config: Config,
  routes: Route[],
): IO<Server> => {
  const logger = Logger('WebServer')

  const withCors = pipe(
    IO.apply(() => express()),
    IO.chain(app =>
      pipe(
        config.allowedOrigins,
        Maybe.fold(
          () => IO.apply(() => app),
          allowedOrigins =>
            IO.apply(() =>
              app.use((req, res, next) =>
                pipe(
                  Dict.lookup('origin', req.headers),
                  Maybe.filter(containedIn(allowedOrigins)),
                  Maybe.fold(
                    () => next(),
                    origin => {
                      res.append('Access-Control-Allow-Origin', origin)
                      res.header(
                        'Access-Control-Allow-Headers',
                        'Origin, X-Requested-With, Content-Type, Accept',
                      )
                      if (req.method === 'OPTIONS') res.send()
                      else next()
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
          IO.apply(() => app[method](path, pipe(middleware, withTry, withLog, toRequestHandler))),
        ),
      ),
    ),
    IO.chain(_ =>
      IO.apply(() =>
        _.use(pipe(EndedMiddleware.text(H.Status.NotFound)(), withLog, toRequestHandler)),
      ),
    ),
    IO.chain(_ => IO.apply(() => _.use(errorHandler(onError)))),
    IO.chain(_ =>
      IO.apply(() => _.listen(config.port, logger.info(`Server listening on port ${config.port}`))),
    ),
  )

  function withLog(middleware: EndedMiddleware): EndedMiddleware {
    return conn =>
      Do(Task.task)
        .bind('res', middleware(conn))
        .bindL('_', ({ res }) =>
          pipe(
            res,
            Either.fold(
              _ => Task.of(undefined),
              ([, _]) => logConnection(logger, _ as ExpressConnection<H.ResponseEnded>),
            ),
          ),
        )
        .return(({ res }) => res)
  }

  function withTry(middleware: EndedMiddleware): EndedMiddleware {
    return conn =>
      pipe(
        Future.apply(() => middleware(conn)()),
        Task.chain(_ =>
          pipe(
            _,
            Either.fold(
              flow(
                onError,
                Task.fromIO,
                Task.chain(_ => EndedMiddleware.text(H.Status.InternalServerError)()(conn)),
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
      List.exists(_ => _ === elem),
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

function isStatus(a: Action): a is { type: 'setStatus'; status: H.Status } {
  return a.type === 'setStatus'
}

function errorHandler(onError: (error: unknown) => IO<unknown>): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    onError(err)()
    res.status(500).end()
  }
}
