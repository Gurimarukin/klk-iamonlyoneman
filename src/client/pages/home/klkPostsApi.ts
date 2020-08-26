import { KlkPosts } from '../../../shared/models/klkPost/KlkPost'
import { Config } from '../../utils/Config'
import { Http } from '../../utils/Http'

export const getKlkPosts = Http.get(`${Config.apiHost}/api/klk-posts`, KlkPosts.codec.decode)
