import { pipe } from 'fp-ts/function'
import { Collection, Db, MongoClient } from 'mongodb'

import { MsDuration } from '../shared/MsDuration'
import { Future, List, Task } from '../shared/utils/fp'

import { Config } from './Config'
import { HealthCheckController } from './controllers/HealthCheckController'
import { KlkPostController } from './controllers/KlkPostController'
import { UserController } from './controllers/UserController'
import { MongoCollection } from './models/MongoCollection'
import { HealthCheckPersistence } from './persistence/HealthCheckPersistence'
import { KlkPostPersistence } from './persistence/KlkPostPersistence'
import { UserPersistence } from './persistence/UserPersistence'
import { HealthCheckService } from './services/HealthCheckService'
import { KlkPostService } from './services/KlkPostService'
import { PartialLogger } from './services/Logger'
import { UserService } from './services/UserService'
import { FutureUtils } from './utils/FutureUtils'
import { Routes } from './webServer/Routes'
import { Route } from './webServer/models/Route'
import { startWebServer } from './webServer/startWebServer'
import { RateLimiter } from './webServer/utils/RateLimiter'
import { WithAuth } from './webServer/utils/WithAuth'
import { WithIp } from './webServer/utils/WithIp'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Context(Logger: PartialLogger, config: Config) {
  const logger = Logger('Context')

  const url = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}`
  const withDb = <A>(f: (db: Db) => Promise<A>): Future<A> =>
    pipe(
      Future.tryCatch(() => MongoClient.connect(url, { useUnifiedTopology: true })),
      Future.chain(client =>
        pipe(
          Future.tryCatch(() => f(client.db(config.db.dbName))),
          Task.chain(either =>
            pipe(
              Future.tryCatch(() => client.close()),
              Future.recover(e =>
                Future.fromIOEither(logger.error('Failed to close client:\n', e)),
              ),
              Task.map(() => either),
            ),
          ),
        ),
      ),
    )
  const mongoCollection: MongoCollection =
    (collName: string) =>
    <A>(f: (c: Collection) => Promise<A>): Future<A> =>
      withDb(db => f(db.collection(collName)))

  const healthCheckPersistence = HealthCheckPersistence(withDb)
  const klkPostPersistence = KlkPostPersistence(Logger, mongoCollection)
  const userPersistence = UserPersistence(Logger, mongoCollection)

  const healthCheckService = HealthCheckService(healthCheckPersistence)
  const klkPostService = KlkPostService(Logger, config, klkPostPersistence)
  const userService = UserService(Logger, userPersistence)

  const withIp = WithIp(Logger, config)
  const withAuth = WithAuth(userService)
  const healthCheckController = HealthCheckController(healthCheckService)
  const klkPostController = KlkPostController(Logger, withAuth, klkPostService)
  const userController = UserController(userService)

  const rateLimiter = RateLimiter(Logger, withIp, MsDuration.days(1))
  const routes: List<Route> = Routes(
    rateLimiter,
    healthCheckController,
    klkPostController,
    userController,
  )

  return {
    Logger,
    ensureIndexes: (): Future<void> =>
      pipe(
        [klkPostPersistence.ensureIndexes(), userPersistence.ensureIndexes()],
        Future.sequenceArray,
        Future.map(() => {}),
        FutureUtils.retryIfFailed(MsDuration.minutes(5), {
          onFailure: e => logger.error('Failed to ensure indexes:\n', e),
          onSuccess: () => logger.info('Ensured indexes'),
        }),
      ),
    initDbIfEmpty: klkPostService.initDbIfEmpty,
    scheduleRedditPolling: klkPostService.scheduleRedditPolling,
    fullPoll: klkPostService.fullPoll,
    addMissingSize: klkPostService.addMissingSize,
    createUser: userService.createUser,
    startWebServer: () => startWebServer(Logger, config, routes),
  }
}

type Context = ReturnType<typeof Context>

export namespace Context {
  export function load(configModifier: (c: Config) => Config = c => c): Future<Context> {
    return pipe(
      Future.Do,
      Future.bind('config', () =>
        pipe(Config.load, Future.fromIOEither, Future.map(configModifier)),
      ),
      Future.bind('Logger', ({ config }) => Future.right(PartialLogger(config.logLevel))),
      Future.map(({ config, Logger }) => Context(Logger, config)),
    )
  }
}
