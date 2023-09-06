import { pipe } from 'fp-ts/function'

import { Future, NotUsed } from '../shared/utils/fp'

import { Config } from './Config'
import { Context } from './Context'

const main: Future<NotUsed> = pipe(
  Future.fromIOEither(Config.load),
  Future.map(Config.Lens.logLevel.set('debug')),
  Future.chain(Context.load),
  Future.chain(({ Logger, downloadImages }) => {
    const logger = Logger('Application')
    return pipe(
      downloadImages,
      Future.chainIOEitherK(() => logger.info('Done')),
    )
  }),
  Future.map(() => process.exit(0)),
)

// eslint-disable-next-line functional/no-expression-statements
Future.runUnsafe(main)
