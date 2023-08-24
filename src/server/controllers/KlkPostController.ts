import { pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'
import * as D from 'io-ts/Decoder'

import { KlkPostsQuery } from '../../shared/models/KlkPostsQuery'
import { NumberFromString } from '../../shared/models/NumberFromString'
import { PartialKlkPostsQuery } from '../../shared/models/PartialKlkPostsQuery'
import { KlkPostDAO, KlkPostDAOs } from '../../shared/models/klkPost/KlkPostDAO'
import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Maybe } from '../../shared/utils/fp'

import { User } from '../models/user/User'
import { KlkPostService } from '../services/KlkPostService'
import { PartialLogger } from '../services/Logger'
import { EndedMiddleware, MyMiddleware as M } from '../webServer/models/MyMiddleware'
import { WithAuth } from '../webServer/utils/WithAuth'

const klkPostsQuery = pipe(
  PartialKlkPostsQuery.decoder,
  D.map(KlkPostsQuery.fromPartial),
  D.intersect(
    D.partial({
      page: NumberFromString.decoder,
    }),
  ),
)

export type KlkPostController = ReturnType<typeof KlkPostController>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function KlkPostController(
  Logger: PartialLogger,
  withAuth: WithAuth,
  klkPostService: KlkPostService,
) {
  const klkPosts: EndedMiddleware = M.withQuery(klkPostsQuery)(({ page, ...query }) =>
    pipe(
      M.fromTaskEither(klkPostService.findAll(query, page ?? 0)),
      M.ichain(M.json(KlkPostDAOs.codec)),
    ),
  )

  const klkPostEdit = (id: KlkPostId): EndedMiddleware =>
    withAuth(user =>
      User.canEditPost(user)
        ? EndedMiddleware.withBody(KlkPostEditPayload.codec)(payload =>
            pipe(
              M.fromTaskEither(klkPostService.updatePostAndGetUpdated(id, payload)),
              M.ichain(
                Maybe.fold(
                  () => M.sendWithStatus(H.Status.BadRequest)(''),
                  M.json(KlkPostDAO.codec),
                ),
              ),
            ),
          )
        : M.sendWithStatus(H.Status.Forbidden)(''),
    )

  return { klkPosts, klkPostEdit }
}
