import { array } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import got from 'got'

import { Future, List, Maybe, NotUsed } from '../shared/utils/fp'

import { Config } from './Config'
import { Context } from './Context'

const removedPng = 'https://i.imgur.com/removed.png'

const main: Future<NotUsed> = pipe(
  Future.fromIOEither(Config.load),
  Future.map(Config.Lens.logLevel.set('debug')),
  Future.chain(Context.load),
  Future.chain(({ Logger }) => {
    const logger = Logger('Application')
    return pipe(
      ['https://i.imgur.com/Tmf6wh6h.jpg', 'https://i.imgur.com/YgkiZi3h.jpg'],
      array.traverse(Future.ApplicativeSeq)(url =>
        pipe(
          Future.tryCatch(() => got.get(url)),
          Future.map(res => {
            const noLongerAvailable = pipe(
              res.request.redirects,
              List.last,
              Maybe.exists(r => r === removedPng),
            )
            console.log(url, res.request.redirects, { noLongerAvailable })
          }),
        ),
      ),
      Future.map(() => {}),
      Future.chainIOEitherK(() => logger.info('Done')),
    )
  }),
  Future.map(() => process.exit(0)),
)

// eslint-disable-next-line functional/no-expression-statements
Future.runUnsafe(main)
