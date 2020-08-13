import { Context } from './Context'
import { Config } from './config/Config'
import { Future, pipe } from '../shared/utils/fp'

pipe(
  Future.fromIOEither(Config.load()),
  Future.chain(config => {
    const context = Context(config)
    const logger = context.Logger('Application')
    return pipe(
      Future.right(undefined),
      Future.chain(_ => context.ensureIndexes()),
      Future.chain(_ => context.initDbIfEmpty()),
      Future.chain(_ => context.scheduleRedditPolling()),
      Future.recover(e => Future.fromIOEither(logger.error(e))),
      Future.chain(_ => Future.fromIOEither(context.startWebServer())),
      Future.chain(_ => Future.fromIOEither(logger.info('Started'))),
    )
  }),
  Future.runUnsafe,
)
