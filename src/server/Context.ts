import { Do, Future, pipe } from '../shared/utils/fp'
import { Config } from './config/Config'
import { KlkPostController } from './controllers/KlkPostController'
import { RateLimiter } from './controllers/RateLimiter'
import { UserController } from './controllers/UserController'
import { WithAuth } from './controllers/WithAuth'
import { WithIp } from './controllers/WithIp'
import { MsDuration } from './models/MsDuration'
import { Route } from './models/Route'
import { KlkPostPersistence } from './persistence/KlkPostPersistence'
import { UserPersistence } from './persistence/UserPersistence'
import { Routes } from './Routes'
import { KlkPostService } from './services/KlkPostService'
import { PartialLogger } from './services/Logger'
import { UserService } from './services/UserService'
import { FutureUtils } from './utils/FutureUtils'
import { MongoPoolParty } from './utils/MongoPoolParty'
import { startWebServer } from './Webserver'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Context(Logger: PartialLogger, config: Config, mongo: MongoPoolParty) {
  const logger = Logger('Context')

  const { mongoCollection } = mongo

  const klkPostPersistence = KlkPostPersistence(Logger, mongoCollection)
  const userPersistence = UserPersistence(Logger, mongoCollection)

  const klkPostService = KlkPostService(Logger, config, klkPostPersistence)
  const userService = UserService(Logger, userPersistence)

  const withIp = WithIp(Logger, config)
  const withAuth = WithAuth(Logger, userService)
  const klkPostController = KlkPostController(Logger, withAuth, klkPostService)
  const userController = UserController(Logger, userService)

  const rateLimiter = RateLimiter(Logger, withIp, MsDuration.days(1))
  const routes: Route[] = Routes(rateLimiter, klkPostController, userController)

  return {
    Logger,

    ensureIndexes: (): Future<void> =>
      pipe(
        [klkPostPersistence.ensureIndexes(), userPersistence.ensureIndexes()],
        Future.parallel,
        Future.map(_ => {}),
        FutureUtils.retryIfFailed(MsDuration.minutes(5), {
          onFailure: e => logger.error('Failed to ensure indexes:\n', e),
          onSuccess: _ => logger.info('Ensured indexes'),
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
    return Do(Future.taskEitherSeq)
      .bind('config', pipe(Config.load(), Future.fromIOEither, Future.map(configModifier)))
      .letL('Logger', ({ config }) => PartialLogger(config.logLevel))
      .bindL('mongo', ({ config, Logger }) => MongoPoolParty(Logger, config))
      .return(({ config, Logger, mongo }) => Context(Logger, config, mongo))
  }
}
