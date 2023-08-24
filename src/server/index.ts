import { pipe } from 'fp-ts/function'

import { Future } from '../shared/utils/fp'

import { Context } from './Context'

// eslint-disable-next-line functional/no-expression-statements
pipe(
  Context.load(),
  Future.chain(({ Logger, ensureIndexes, startWebServer }) => {
    const logger = Logger('Application')
    return pipe(
      Future.right(undefined),
      Future.chain(() => ensureIndexes()),
      Future.recover(e => Future.fromIOEither(logger.error(e))),
      Future.chain(() => Future.fromIOEither(startWebServer())),
      Future.chain(() => Future.fromIOEither(logger.info('Started'))),
    )
  }),
  f => Future.runUnsafe<void>(f),
)
