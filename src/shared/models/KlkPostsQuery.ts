import { eq as eq_ } from 'fp-ts'
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'

import { Dict, Maybe } from '../utils/fp'
import { EpisodeNumber, PartialKlkPostsQuery, PostActive, PostsSort } from './PartialKlkPostsQuery'

export namespace KlkPostsQuery {
  export const fromPartial = (partial: PartialKlkPostsQuery): KlkPostsQuery => {
    const episode = Maybe.fromNullable(partial.episode)
    const search = pipe(
      Maybe.fromNullable(partial.search?.trim()),
      Maybe.filter(s => s !== ''),
    )
    const sortNew = getSortNew(episode, partial.sort)
    const active = getActive(partial.active)
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

  export const eq: Eq<KlkPostsQuery> = eq_.getStructEq({
    episode: Maybe.getEq(EpisodeNumber.eq),
    search: Maybe.getEq(eq_.eqString),
    sortNew: eq_.eqBoolean,
    active: eq_.eqBoolean,
  })
}

const getSortNew = (episode: Maybe<EpisodeNumber>, sort: PostsSort | undefined): boolean =>
  sort === 'new' || (sort !== 'old' && Maybe.isNone(episode))

const getActive = (active: PostActive | undefined): boolean => active !== 'false'

export type KlkPostsQuery = {
  readonly episode: Maybe<EpisodeNumber>
  readonly search: Maybe<string>
  readonly sortNew: boolean
  readonly active: boolean
}
