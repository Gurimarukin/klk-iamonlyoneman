import { pipe } from 'fp-ts/function'

import { Dict, Maybe } from '../utils/fp'
import { EpisodeNumber, PartialKlkPostsQuery, PostsSort } from './PartialKlkPostsQuery'

export namespace KlkPostsQuery {
  export const fromPartial = (partial: PartialKlkPostsQuery): KlkPostsQuery => {
    const episode = Maybe.fromNullable(partial.episode)
    const search = Maybe.fromNullable(partial.search)
    const sortNew = partial.sort === 'new' || (partial.sort !== 'old' && Maybe.isNone(episode))
    const active = partial.active !== 'false'
    return { episode, search, sortNew, active }
  }

  export const toPartial = (query: KlkPostsQuery): PartialKlkPostsQuery => {
    const res: PartialKlkPostsQuery = {
      episode: Maybe.toUndefined(query.episode),
      search: Maybe.toUndefined(query.search),
      sort: ((): PostsSort | undefined => {
        if (Maybe.isSome(query.episode)) {
          return query.sortNew ? 'new' : undefined
        } else {
          return query.sortNew ? undefined : 'old'
        }
      })(),
      active: query.active ? undefined : 'false',
    }
    return pipe(
      res,
      Dict.filter(val => val !== undefined),
    )
  }
}

export type KlkPostsQuery = {
  readonly episode: Maybe<EpisodeNumber>
  readonly search: Maybe<string>
  readonly sortNew: boolean
  readonly active: boolean
}
