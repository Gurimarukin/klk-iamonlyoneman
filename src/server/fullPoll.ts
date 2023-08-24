import { pipe } from 'fp-ts/function'

import { Future } from '../shared/utils/fp'

import { Config } from './Config'
import { Context } from './Context'

// eslint-disable-next-line functional/no-expression-statements
pipe(
  Context.load(Config.Lens.logLevel.set('debug')),
  Future.chain(({ Logger, ensureIndexes, fullPoll }) => {
    const logger = Logger('Application')
    return pipe(
      Future.right(undefined),
      Future.chain(() => ensureIndexes()),
      Future.chain(() => fullPoll()),
      Future.recover(e => Future.fromIOEither(logger.error(e))),
      Future.chain(() => Future.fromIOEither(logger.info('Done'))),
    )
  }),
  Future.map(() => process.exit(0)),
  f => Future.runUnsafe<void>(f),
)
