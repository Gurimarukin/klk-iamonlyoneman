import { Future, pipe } from '../shared/utils/fp'
import { Context } from './Context'

pipe(
  Context.load(),
  Future.chain(({ Logger, ensureIndexes, fullPoll }) => {
    const logger = Logger('Application')
    return pipe(
      Future.right(undefined),
      Future.chain(_ => ensureIndexes()),
      Future.chain(_ => fullPoll()),
      Future.recover(e => Future.fromIOEither(logger.error(e))),
      Future.chain(_ => Future.fromIOEither(logger.info('Done'))),
    )
  }),
  f => Future.runUnsafe<void>(f),
)
