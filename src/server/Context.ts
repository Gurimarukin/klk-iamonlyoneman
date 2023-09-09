import { pipe } from 'fp-ts/function'

import { MsDuration } from '../shared/MsDuration'
import { StringUtils } from '../shared/utils/StringUtils'
import { Future, List, NonEmptyArray } from '../shared/utils/fp'

import { Config } from './Config'
import { HealthCheckController } from './controllers/HealthCheckController'
import { KlkPostController } from './controllers/KlkPostController'
import { UserController } from './controllers/UserController'
import { LoggerGetter } from './models/logger/LoggerGetter'
import { MongoCollectionGetter } from './models/mongo/MongoCollection'
import { WithDb } from './models/mongo/WithDb'
import { HealthCheckPersistence } from './persistence/HealthCheckPersistence'
import { KlkPostPersistence } from './persistence/KlkPostPersistence'
import { UserPersistence } from './persistence/UserPersistence'
import { HealthCheckService } from './services/HealthCheckService'
import { KlkPostService } from './services/KlkPostService'
import { UserService } from './services/UserService'
import { getOnError } from './utils/getOnError'
import { Routes } from './webServer/Routes'
import { Route } from './webServer/models/Route'
import { startWebServer } from './webServer/startWebServer'
import { RateLimiter } from './webServer/utils/RateLimiter'
import { WithAuth } from './webServer/utils/WithAuth'
import { WithIp } from './webServer/utils/WithIp'

const dbRetryDelay = MsDuration.seconds(10)

type Context = ReturnType<typeof of>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function of(
  config: Config,
  Logger: LoggerGetter,
  healthCheckService: HealthCheckService,
  klkPostPersistence: KlkPostPersistence,
  userPersistence: UserPersistence,
) {
  const klkPostService = KlkPostService(config, Logger, klkPostPersistence)
  const userService = UserService(Logger, userPersistence)

  const withIp = WithIp(Logger, config)
  const withAuth = WithAuth(userService)
  const healthCheckController = HealthCheckController(healthCheckService)
  const klkPostController = KlkPostController(withAuth, klkPostService)
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
    addMissingSize: klkPostService.addMissingSize,
    downloadImages: klkPostService.downloadImages,
    createUser: userService.createUser,
    startWebServer: startWebServer(Logger, config, routes),
  }
}

const load = (config: Config): Future<Context> => {
  const Logger = LoggerGetter(config.logLevel)
  const logger = Logger('Context')

  const withDb = WithDb.of(getOnError(logger), {
    url: `mongodb://${config.db.user}:${config.db.password}@${config.db.host}`,
    dbName: config.db.dbName,
  })

  const mongoCollection: MongoCollectionGetter = MongoCollectionGetter.fromWithDb(withDb)

  const healthCheckPersistence = HealthCheckPersistence(withDb)
  const klkPostPersistence = KlkPostPersistence(Logger, mongoCollection)
  const userPersistence = UserPersistence(Logger, mongoCollection)

  const healthCheckService = HealthCheckService(healthCheckPersistence)

  const context = of(config, Logger, healthCheckService, klkPostPersistence, userPersistence)

  const waitDatabaseReady: Future<boolean> = pipe(
    healthCheckService.check,
    Future.orElse(() =>
      pipe(
        logger.info(
          `Couldn't connect to mongo, waiting ${StringUtils.prettyMs(
            dbRetryDelay,
          )} before next try`,
        ),
        Future.fromIOEither,
        Future.chain(() => pipe(waitDatabaseReady, Future.delay(dbRetryDelay))),
      ),
    ),
    Future.filterOrElse(
      success => success,
      () => Error("HealthCheck wasn't success"),
    ),
  )

  return pipe(
    logger.info('Ensuring indexes'),
    Future.fromIOEither,
    Future.chain(() => waitDatabaseReady),
    Future.chain(() =>
      NonEmptyArray.sequence(Future.ApplicativeSeq)([
        klkPostPersistence.ensureIndexes,
        userPersistence.ensureIndexes,
      ]),
    ),
    Future.chainIOEitherK(() => logger.info('Ensured indexes')),
    Future.map(() => context),
  )
}

const Context = { load }

export { Context }
