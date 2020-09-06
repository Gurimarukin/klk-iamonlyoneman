import * as H from 'hyper-ts'
import * as D from 'io-ts/lib/Decoder'

import { KlkPosts } from '../../shared/models/klkPost/KlkPost'
import { PartialKlkPostQuery } from '../../shared/models/PartialKlkPostQuery'
import { flow, pipe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { KlkPostsQuery } from '../models/KlkPostsQuery'
import { KlkPostService } from '../services/KlkPostService'
import { PartialLogger } from '../services/Logger'
import { ControllerUtils } from '../utils/ControllerUtils'

const klkPostsQuery = pipe(PartialKlkPostQuery.decoder, D.map(KlkPostsQuery.fromPartial))

export type KlkPostController = ReturnType<typeof KlkPostController>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostController(Logger: PartialLogger, klkPostService: KlkPostService) {
  const logger = Logger('KlkPostController')

  const klkPosts: EndedMiddleware = ControllerUtils.withQuery(klkPostsQuery.decode)(
    query =>
      pipe(
        klkPostService.findAll(query),
        H.fromTaskEither,
        H.ichain(posts => EndedMiddleware.json(H.Status.OK)(KlkPosts.codec.encode(posts))),
      ),
    flow(D.draw, logger.debug),
  )

  return { klkPosts }
}
