import { Future, pipe } from '../shared/utils/fp'

import { Context } from './Context'
import { Config } from './config/Config'

pipe(
  Future.fromIOEither(Config.load()),
  Future.chain(config => {
    const context = Context(config)
    const logger = context.Logger('Application')
    const klkPostService = context.klkPostService
    return pipe(
      Future.right(undefined),
      Future.chain(_ => context.ensureIndexes()),
      Future.chain(_ => klkPostService.initDbIfEmpty()),
      Future.chain(_ => klkPostService.scheduleRedditPolling()),
      Future.recover(e => Future.fromIOEither(logger.error(e))),
      Future.chain(_ => Future.fromIOEither(context.startWebServer())),
      Future.chain(_ => Future.fromIOEither(logger.info('Started'))),
    )
  }),
  Future.runUnsafe,
)
