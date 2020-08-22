import { Future, pipe } from '../shared/utils/fp'

import { Context } from './Context'
import { Config } from './config/Config'

pipe(
  Future.fromIOEither(Config.load()),
  Future.chain(config => {
    const context = Context({ ...config, logLevel: 'debug' })
    const logger = context.Logger('Application')
    const klkPostService = context.klkPostService
    return pipe(
      Future.right(undefined),
      Future.chain(_ => context.ensureIndexes()),
      Future.chain(_ => klkPostService.addMissingSize()),
      Future.recover(e => Future.fromIOEither(logger.error(e))),
      Future.chain(_ => Future.fromIOEither(logger.info('Done'))),
    )
  }),
  Future.runUnsafe,
)
