import { pipe } from 'fp-ts/function'

import { Future, NotUsed } from '../shared/utils/fp'

import { Config } from './Config'
import { Context } from './Context'

const main: Future<NotUsed> = pipe(
  Future.fromIOEither(Config.load),
  Future.chain(Context.load),
  Future.chain(({ Logger, startWebServer }) => {
    const logger = Logger('Application')
    return pipe(
      Future.fromIOEither(startWebServer),
      Future.chain(() => Future.fromIOEither(logger.info('Started'))),
    )
  }),
)

// eslint-disable-next-line functional/no-expression-statements
Future.runUnsafe(main)
