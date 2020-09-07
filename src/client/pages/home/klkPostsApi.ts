import { KlkPostDAO, KlkPostDAOs } from '../../../shared/models/klkPost/KlkPostDAO'
import { KlkPostEditPayload } from '../../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../../shared/models/klkPost/KlkPostId'
import { PartialKlkPostQuery } from '../../../shared/models/PartialKlkPostQuery'
import { Future } from '../../../shared/utils/fp'
import { apiRoutes } from '../../utils/apiRoutes'
import { Http } from '../../utils/Http'

export const getKlkPosts = (query: PartialKlkPostQuery): Future<KlkPostDAOs> =>
  Http.get(apiRoutes.klkPosts(query), KlkPostDAOs.codec.decode)

export const postKlkPostEditForm = (
  id: KlkPostId,
  payload: KlkPostEditPayload,
): Future<KlkPostDAO> =>
  Http.post(
    apiRoutes.klkPost(id),
    payload,
    KlkPostEditPayload.codec.encode,
    KlkPostDAO.codec.decode,
  )
