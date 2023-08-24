import { Token } from '../../../shared/models/Token'
import { KlkPostDAO, KlkPostDAOs } from '../../../shared/models/klkPost/KlkPostDAO'
import { KlkPostEditPayload } from '../../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../../shared/models/klkPost/KlkPostId'
import { Future } from '../../../shared/utils/fp'

import { Http } from '../../utils/Http'
import { apiRoutes } from '../../utils/apiRoutes'

export const getKlkPosts = (url: string): Promise<KlkPostDAOs> =>
  Http.get(url, KlkPostDAOs.codec.decode)

export const postKlkPostEditForm = (
  id: KlkPostId,
  payload: KlkPostEditPayload,
  token: Token,
): Future<KlkPostDAO> =>
  Http.post(
    apiRoutes.klkPost(id),
    payload,
    KlkPostEditPayload.codec.encode,
    KlkPostDAO.codec.decode,
    Http.withToken(token),
  )
