import { Context } from './Context'
import { Config } from './config/Config'
import { Future, pipe } from '../shared/utils/fp'

pipe(
  Future.fromIOEither(Config.load()),
  Future.chain(config => {
    const context = Context({ ...config, logLevel: 'debug' })
    const logger = context.Logger('Application')
    return pipe(
      Future.right(undefined),
      Future.chain(_ => context.ensureIndexes()),
      Future.chain(_ => context.klkPostService.fullPoll()),
      Future.recover(e => Future.fromIOEither(logger.error(e))),
      Future.chain(_ => Future.fromIOEither(logger.info('Done'))),
    )
  }),
  Future.runUnsafe,
)
