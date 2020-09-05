import {
  EpisodeNumber,
  PartialKlkPostQuery,
  PostsSort,
} from '../../shared/models/PartialKlkPostQuery'
import { Maybe } from '../../shared/utils/fp'

export namespace KlkPostsQuery {
  export const fromPartial = (partial: PartialKlkPostQuery): KlkPostsQuery => {
    const episode = Maybe.fromNullable(partial.episode)
    const search = Maybe.fromNullable(partial.search)
    const sort =
      partial.sort !== undefined ? partial.sort : PartialKlkPostQuery.defaultSort(episode)
    return { episode, search, sort }
  }
}

export type KlkPostsQuery = Readonly<{
  episode: Maybe<EpisodeNumber>
  search: Maybe<string>
  sort: PostsSort
}>
