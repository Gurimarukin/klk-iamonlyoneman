import qs from 'qs'

import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { PartialKlkPostsQuery } from '../../shared/models/PartialKlkPostsQuery'
import { Dict } from '../../shared/utils/fp'
import { Config } from './Config'

export const apiRoutes = {
  klkPosts: (query: PartialKlkPostsQuery, page: number | undefined): string => {
    const params: Partial<Dict<string, string>> = {
      page: `${page}`,
      ...PartialKlkPostsQuery.encoder.encode(query),
    }
    const str = qs.stringify(params)
    return `${Config.apiHost}/api/klk-posts${str === '' ? '' : `?${str}`}`
  },
  klkPost: (id: KlkPostId): string => `${Config.apiHost}/api/klk-posts/${KlkPostId.unwrap(id)}`,

  login: `${Config.apiHost}/api/login`,
}
