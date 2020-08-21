import { Collection, MongoClient } from 'mongodb'

import { Either, Future, IO, Task, pipe } from '../shared/utils/fp'

import { startWebServer } from './Webserver'
import { Config } from './config/Config'
import { KlkPostController } from './controllers/KlkPostController'
import { Route } from './models/Route'
import { KlkPostPersistence } from './persistence/KlkPostPersistence'
import { Routes } from './routes/Routes'
import { KlkPostService } from './services/KlkPostService'
import { KlkSearchService } from './services/KlkSearchService'
import { PartialLogger } from './services/Logger'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Context(config: Config) {
  const Logger = PartialLogger(config.logLevel)
  const logger = Logger('Context')

  const url = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}`
  // const collections: Promise<MongoClient[]> = pipe(
  //   List.makeBy(10, _ => 0),
  //   List.map(_ => Future.apply(() => new MongoClient(url, { useUnifiedTopology: true })
  // .connect())),
  //   List.sequence(Future.taskEither),
  //   Future.runUnsafe,
  // )
  const mongoCollection = (coll: string) => <A>(f: (coll: Collection) => Promise<A>): Future<A> =>
    pipe(
      Future.apply(() => new MongoClient(url, { useUnifiedTopology: true }).connect()),
      Future.chain(client =>
        pipe(
          Future.apply(() => f(client.db(config.db.dbName).collection(coll))),
          Task.chain(res =>
            pipe(
              Future.apply(() => client.close()),
              Task.map(_ => res),
            ),
          ),
        ),
      ),
    )

  const klkPostPersistence = KlkPostPersistence(Logger, mongoCollection)

  const klkSearchService = KlkSearchService(Logger)

  const klkPostService = KlkPostService(Logger, klkPostPersistence, klkSearchService)

  const klkPostController = KlkPostController(Logger, klkPostService)

  const routes: Route[] = Routes(klkPostController)

  return {
    Logger,

    ensureIndexes: (): Future<void> =>
      retryIfFailed(
        pipe(
          [klkPostPersistence.ensureIndexes()],
          Future.parallel,
          Future.map(_ => {}),
        ),
      ),

    klkPostService,

    startWebServer: () => startWebServer(Logger, config, routes),
  }

  function retryIfFailed(f: Future<void>, firstTime = true): Future<void> {
    return pipe(
      f,
      Task.chain(
        Either.fold(
          e =>
            pipe(
              firstTime ? logger.error('Failed to ensure indexes:\n', e) : IO.unit,
              IO.chain(_ => IO.runFuture(Task.delay(5 * 60 * 1000)(retryIfFailed(f, false)))),
              Future.fromIOEither,
            ),
          _ => Future.fromIOEither(logger.info('Ensured indexes')),
        ),
      ),
    )
  }
}

type Context = ReturnType<typeof Context>
