import { Future, pipe } from '../shared/utils/fp'
import { Config } from './config/Config'
import { Context } from './Context'

pipe(
  Context.load(Config.Lens.logLevel.set('debug')),
  Future.chain(({ Logger, ensureIndexes, createUser }) => {
    const logger = Logger('Application')
    return pipe(
      Future.right(undefined),
      Future.chain(_ => ensureIndexes()),
      Future.chain(_ => createUser()),
      Future.recover(e => Future.fromIOEither(logger.error(e))),
      Future.chain(_ => Future.fromIOEither(logger.info('Done'))),
    )
  }),
  f => Future.runUnsafe<void>(f),
)
