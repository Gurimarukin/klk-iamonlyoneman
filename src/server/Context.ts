import { MongoClient, Collection } from 'mongodb'

import { pipe, Future, todo, Task, Either, IO } from '../shared/utils/fp'

import { Config } from './config/Config'
import { KlkPostPersistence } from './persistence/KlkPostPersistence'
import { KlkPostService } from './services/KlkPostService'
import { KlkSearchService } from './services/KlkSearchService'
import { PartialLogger } from './services/Logger'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Context(config: Config) {
  const Logger = PartialLogger(config.logLevel)
  const logger = Logger('Context')

  const url = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}`
  const mongoCollection = (coll: string): Future<Collection> =>
    pipe(
      Future.apply(() => new MongoClient(url, { useUnifiedTopology: true }).connect()),
      Future.map(_ => _.db(config.db.dbName).collection(coll)),
    )

  const klkPostPersistence = KlkPostPersistence(Logger, mongoCollection)

  const klkSearchService = KlkSearchService(Logger)

  const klkPostService = KlkPostService(Logger, klkPostPersistence, klkSearchService)

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

    initDbIfEmpty: (): Future<void> => klkPostService.initDbIfEmpty(),

    scheduleRedditPolling: (): Future<void> => Future.apply(() => todo(klkPostService)),
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
