import qs from 'qs'

import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { PartialKlkPostsQuery } from '../../shared/models/PartialKlkPostsQuery'
import { Dict } from '../../shared/utils/fp'
import { s } from '../../shared/utils/StringUtils'
import { Config } from './Config'

export const apiRoutes = {
  klkPosts: (query: PartialKlkPostsQuery, page: number | undefined): string => {
    const params: Partial<Dict<string, string>> = {
      page: s`${page}`,
      ...PartialKlkPostsQuery.encoder.encode(query),
    }
    const str = qs.stringify(params)
    return s`${Config.apiHost}/api/klk-posts${str === '' ? '' : `?${str}`}`
  },
  klkPost: (id: KlkPostId): string => s`${Config.apiHost}/api/klk-posts/${id}`,

  login: s`${Config.apiHost}/api/login`,
}
