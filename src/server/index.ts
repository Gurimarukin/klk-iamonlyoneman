import { pipe } from 'fp-ts/function'

import { Future } from '../shared/utils/fp'
import { Context } from './Context'

// eslint-disable-next-line functional/no-expression-statement
pipe(
  Context.load(),
  Future.chain(
    ({ Logger, ensureIndexes, initDbIfEmpty, scheduleRedditPolling, startWebServer }) => {
      const logger = Logger('Application')
      return pipe(
        Future.right(undefined),
        Future.chain(() => ensureIndexes()),
        Future.chain(() => initDbIfEmpty()),
        Future.chain(() => scheduleRedditPolling()),
        Future.recover(e => Future.fromIOEither(logger.error(e))),
        Future.chain(() => Future.fromIOEither(startWebServer())),
        Future.chain(() => Future.fromIOEither(logger.info('Started'))),
      )
    },
  ),
  f => Future.runUnsafe<void>(f),
)
