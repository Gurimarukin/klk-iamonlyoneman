import { Do, Future, pipe } from '../shared/utils/fp'
import { Config } from './config/Config'
import { KlkPostController } from './controllers/KlkPostController'
import { MsDuration } from './models/MsDuration'
import { Route } from './models/Route'
import { KlkPostPersistence } from './persistence/KlkPostPersistence'
import { Routes } from './routes/Routes'
import { KlkPostService } from './services/KlkPostService'
import { PartialLogger } from './services/Logger'
import { FutureUtils } from './utils/FutureUtils'
import { MongoPoolParty } from './utils/MongoPoolParty'
import { startWebServer } from './Webserver'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Context(Logger: PartialLogger, config: Config, mongo: MongoPoolParty) {
  const logger = Logger('Context')

  const { mongoCollection } = mongo

  const klkPostPersistence = KlkPostPersistence(Logger, mongoCollection)

  const klkPostService = KlkPostService(Logger, config, klkPostPersistence)

  const klkPostController = KlkPostController(Logger, klkPostService)

  const routes: Route[] = Routes(klkPostController)

  return {
    Logger,

    ensureIndexes: (): Future<void> =>
      pipe(
        [klkPostPersistence.ensureIndexes()],
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

    startWebServer: () => startWebServer(Logger, config, routes),
  }
}

type Context = ReturnType<typeof Context>

export namespace Context {
  export function load(): Future<Context> {
    return Do(Future.taskEitherSeq)
      .bindL('config', () => Future.fromIOEither(Config.load()))
      .letL('Logger', ({ config }) => PartialLogger(config.logLevel))
      .bindL('mongo', ({ config, Logger }) => MongoPoolParty(Logger, config))
      .return(({ config, Logger, mongo }) => Context(Logger, config, mongo))
  }
}
