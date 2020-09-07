import qs from 'qs'

import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { PartialKlkPostQuery } from '../../shared/models/PartialKlkPostQuery'
import { Config } from './Config'

export const apiRoutes = {
  klkPosts: (query: PartialKlkPostQuery): string => {
    const str = qs.stringify(PartialKlkPostQuery.encoder.encode(query))
    return `${Config.apiHost}/api/klk-posts${str === '' ? '' : '?'}${str}`
  },
  klkPost: (id: KlkPostId): string => `${Config.apiHost}/api/klk-posts/${id}`,

  login: `${Config.apiHost}/api/login`,
}
