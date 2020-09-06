import qs from 'qs'

import { PartialKlkPostQuery } from '../../shared/models/PartialKlkPostQuery'
import { Config } from './Config'

export const apiRoutes = {
  klkPosts: (query: PartialKlkPostQuery): string => {
    const str = qs.stringify(PartialKlkPostQuery.encoder.encode(query))
    return `${Config.apiHost}/api/klk-posts${str === '' ? '' : '?'}${str}`
  },

  login: `${Config.apiHost}/api/login`,
}
