import { Context } from './Context'
import { Config } from './config/Config'
import { Future, pipe } from '../shared/utils/fp'

pipe(
  Future.fromIOEither(Config.load()),
  Future.chain(config => {
    const { Logger, ensureIndexes, initDbIfEmpty, scheduleRedditPolling } = Context(config)
    const logger = Logger('Application')
    return pipe(
      Future.right(undefined),
      Future.chain(_ => ensureIndexes()),
      Future.chain(_ => initDbIfEmpty()),
      Future.chain(_ => scheduleRedditPolling()),
      Future.recover(e => Future.fromIOEither(logger.error(e))),
      Future.chain(_ => Future.fromIOEither(logger.info('Started'))),
    )
  }),
  Future.runUnsafe,
)
