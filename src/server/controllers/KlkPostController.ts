import * as H from 'hyper-ts'
import * as D from 'io-ts/Decoder'

import { KlkPostDAO, KlkPostDAOs } from '../../shared/models/klkPost/KlkPostDAO'
import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { NumberFromString } from '../../shared/models/NumberFromString'
import { PartialKlkPostQuery } from '../../shared/models/PartialKlkPostQuery'
import { Maybe, flow, pipe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { KlkPostsQuery } from '../models/KlkPostsQuery'
import { User } from '../models/user/User'
import { KlkPostService } from '../services/KlkPostService'
import { PartialLogger } from '../services/Logger'
import { ControllerUtils } from '../utils/ControllerUtils'
import { WithAuth } from './WithAuth'

const klkPostsQuery = pipe(
  PartialKlkPostQuery.decoder,
  D.map(KlkPostsQuery.fromPartial),
  D.intersect(
    D.partial({
      page: NumberFromString.decoder,
    }),
  ),
)

export type KlkPostController = ReturnType<typeof KlkPostController>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostController(
  Logger: PartialLogger,
  withAuth: WithAuth,
  klkPostService: KlkPostService,
) {
  const logger = Logger('KlkPostController')

  const klkPosts: EndedMiddleware = ControllerUtils.withQuery(klkPostsQuery.decode)(
    ({ page, ...query }) =>
      pipe(
        H.fromTaskEither(klkPostService.findAll(query, page === undefined ? 0 : page)),
        H.ichain(EndedMiddleware.json(H.Status.OK, KlkPostDAOs.codec.encode)),
      ),
    flow(D.draw, logger.debug),
  )

  const klkPostEdit = (id: KlkPostId): EndedMiddleware =>
    withAuth(user =>
      User.canEditPost(user)
        ? ControllerUtils.withJsonBody(KlkPostEditPayload.codec.decode)(payload =>
            pipe(
              H.fromTaskEither(klkPostService.updatePostAndGetUpdated(id, payload)),
              H.ichain(
                Maybe.fold(
                  () => EndedMiddleware.text(H.Status.BadRequest)(),
                  EndedMiddleware.json(H.Status.OK, KlkPostDAO.codec.encode),
                ),
              ),
            ),
          )
        : EndedMiddleware.text(H.Status.Forbidden)(),
    )

  return { klkPosts, klkPostEdit }
}
