import { boolean, eq, string } from 'fp-ts'
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'

import { Dict, Maybe } from '../utils/fp'
import {
  EpisodeNumber,
  PartialKlkPostsQuery,
  PostActive,
  PostAvailable,
  PostsSort,
} from './PartialKlkPostsQuery'

type KlkPostsQuery = {
  episode: Maybe<EpisodeNumber>
  available: PostAvailable
  search: Maybe<string>
  sortNew: boolean
  active: boolean
}

const defaultAvailable: PostAvailable = 'yes'

const fromPartial = (partial: PartialKlkPostsQuery): KlkPostsQuery => {
  const episode = Maybe.fromNullable(partial.episode)
  const available = partial.available ?? defaultAvailable
  const search = pipe(
    Maybe.fromNullable(partial.search?.trim()),
    Maybe.filter(s => s !== ''),
  )
  const sortNew = getSortNew(episode, partial.sort)
  const active = getActive(partial.active)
  return { episode, available, search, sortNew, active }
}

const toPartial = (query: KlkPostsQuery): PartialKlkPostsQuery => {
  const res: PartialKlkPostsQuery = {
    episode: Maybe.toUndefined(query.episode),
    available: query.available === defaultAvailable ? undefined : query.available,
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
    Dict.filter(val => (val as typeof val | undefined) !== undefined),
  )
}

const Eq_: Eq<KlkPostsQuery> = eq.struct({
  episode: Maybe.getEq(EpisodeNumber.Eq),
  available: string.Eq,
  search: Maybe.getEq(string.Eq),
  sortNew: boolean.Eq,
  active: boolean.Eq,
})

const getSortNew = (episode: Maybe<EpisodeNumber>, sort: PostsSort | undefined): boolean =>
  sort === 'new' || (sort !== 'old' && Maybe.isNone(episode))

const getActive = (active: PostActive | undefined): boolean => active !== 'false'

const KlkPostsQuery = { fromPartial, toPartial, Eq: Eq_ }

export { KlkPostsQuery }
