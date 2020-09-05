import * as H from 'hyper-ts'
import * as D from 'io-ts/lib/Decoder'

import { KlkPosts } from '../../shared/models/klkPost/KlkPost'
import { Maybe, flow, pipe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { ControllerUtils } from '../routes/ControllerUtils'
import { KlkPostService } from '../services/KlkPostService'
import { PartialLogger } from '../services/Logger'

const between1and25 = pipe(
  D.string,
  D.parse(s => {
    const n = parseInt(s, 10)
    return isNaN(n) ? D.failure(s, 'number from string') : D.success(n)
  }),
  D.refine((n): n is number => 1 <= n, 'greater or equal to 1'),
  D.refine((n): n is number => n <= 25, 'lower or equal to 25'),
)

const qEpisode = D.type({ q: D.union(between1and25, D.literal('unknown')) })
// const qSearch = D.type({ q: D.string })

export type KlkPostController = ReturnType<typeof KlkPostController>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostController(Logger: PartialLogger, klkPostService: KlkPostService) {
  const logger = Logger('KlkPostController')

  const episode: EndedMiddleware = ControllerUtils.withQuery(qEpisode.decode)(
    ({ q }) =>
      pipe(
        q,
        Maybe.fromPredicate((q): q is number => q !== 'unknown'),
        klkPostService.findByEpisode,
        H.fromTaskEither,
        H.ichain(posts => EndedMiddleware.json(H.Status.OK)(KlkPosts.codec.encode(posts))),
      ),
    flow(D.draw, logger.debug),
  )

  const search: EndedMiddleware = ControllerUtils.notImplementedYet

  return { episode, search }
}
