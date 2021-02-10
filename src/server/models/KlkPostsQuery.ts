import { EpisodeNumber, PartialKlkPostQuery } from '../../shared/models/PartialKlkPostQuery'
import { Maybe } from '../../shared/utils/fp'

export namespace KlkPostsQuery {
  export const fromPartial = (partial: PartialKlkPostQuery): KlkPostsQuery => {
    const episode = Maybe.fromNullable(partial.episode)
    const search = Maybe.fromNullable(partial.search)
    const sortNew = partial.sort === 'new' || (partial.sort !== 'old' && Maybe.isNone(episode))
    const active = partial.active !== 'false'
    return { episode, search, sortNew, active }
  }
}

export type KlkPostsQuery = {
  readonly episode: Maybe<EpisodeNumber>
  readonly search: Maybe<string>
  readonly sortNew: boolean
  readonly active: boolean
}
