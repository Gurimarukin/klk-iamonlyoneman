import { Future, pipe } from '../shared/utils/fp'
import { Context } from './Context'

pipe(
  Context.load(),
  Future.chain(
    ({ Logger, ensureIndexes, initDbIfEmpty, scheduleRedditPolling, startWebServer }) => {
      const logger = Logger('Application')
      return pipe(
        Future.right(undefined),
        Future.chain(_ => ensureIndexes()),
        Future.chain(_ => initDbIfEmpty()),
        Future.chain(_ => scheduleRedditPolling()),
        Future.recover(e => Future.fromIOEither(logger.error(e))),
        Future.chain(_ => Future.fromIOEither(startWebServer())),
        Future.chain(_ => Future.fromIOEither(logger.info('Started'))),
      )
    },
  ),
  f => Future.runUnsafe<void>(f),
)
