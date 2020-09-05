import { KlkPosts } from '../../../shared/models/klkPost/KlkPost'
import { PartialKlkPostQuery } from '../../../shared/models/PartialKlkPostQuery'
import { Future } from '../../../shared/utils/fp'
import { apiRoutes } from '../../utils/apiRoutes'
import { Http } from '../../utils/Http'

export const getKlkPosts = (query: PartialKlkPostQuery): Future<KlkPosts> =>
  Http.get(apiRoutes.klkPosts(query), KlkPosts.codec.decode)
