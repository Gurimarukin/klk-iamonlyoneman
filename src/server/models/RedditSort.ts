import { List } from '../../shared/utils/fp'

export type RedditSort = 'relevance' | 'hot' | 'top' | 'new' | 'comments'

export namespace RedditSort {
  export const values: List<RedditSort> = ['relevance', 'hot', 'top', 'new', 'comments']
}
