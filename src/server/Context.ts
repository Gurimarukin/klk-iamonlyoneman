import { pipe } from 'fp-ts/function'
import { Collection, Db, MongoClient } from 'mongodb'

import { Future, List } from '../shared/utils/fp'
import { s } from '../shared/utils/StringUtils'
import { Config } from './config/Config'
import { HealthCheckController } from './controllers/HealthCheckController'
import { KlkPostController } from './controllers/KlkPostController'
import { RateLimiter } from './controllers/RateLimiter'
import { UserController } from './controllers/UserController'
import { WithAuth } from './controllers/WithAuth'
import { WithIp } from './controllers/WithIp'
import { MongoCollection } from './models/MongoCollection'
import { MsDuration } from './models/MsDuration'
import { Route } from './models/Route'
import { HealthCheckPersistence } from './persistence/HealthCheckPersistence'
import { KlkPostPersistence } from './persistence/KlkPostPersistence'
import { UserPersistence } from './persistence/UserPersistence'
import { Routes } from './Routes'
import { HealthCheckService } from './services/HealthCheckService'
import { KlkPostService } from './services/KlkPostService'
import { PartialLogger } from './services/Logger'
import { UserService } from './services/UserService'
import { FutureUtils } from './utils/FutureUtils'
import { startWebServer } from './Webserver'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Context(Logger: PartialLogger, config: Config) {
  const logger = Logger('Context')

  const url = s`mongodb://${config.db.user}:${config.db.password}@${config.db.host}`
  const withDb = <A>(f: (db: Db) => Promise<A>): Future<A> =>
    pipe(
      Future.tryCatch(() => MongoClient.connect(url, { useUnifiedTopology: true })),
      Future.chain(client => Future.tryCatch(() => f(client.db(config.db.dbName)))),
    )
  const mongoCollection: MongoCollection = (collName: string) => <A>(
    f: (c: Collection) => Promise<A>,
  ): Future<A> => withDb(db => f(db.collection(collName)))

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
        pipe(Config.load(), Future.fromIOEither, Future.map(configModifier)),
      ),
      Future.bind('Logger', ({ config }) => Future.right(PartialLogger(config.logLevel))),
      Future.map(({ config, Logger }) => Context(Logger, config)),
    )
  }
}
