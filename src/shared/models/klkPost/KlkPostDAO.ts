import { eq } from 'fp-ts'
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'

import { List, Maybe } from '../../utils/fp'
import { DateFromISOString } from '../DateFromISOString'
import { KlkPostsQuery } from '../KlkPostsQuery'
import { EpisodeNumber } from '../PartialKlkPostsQuery'
import { KlkPostId } from './KlkPostId'
import { Size } from './Size'

const maybeNumberEq: Eq<Maybe<number>> = Maybe.getEq(eq.eqNumber)

// KlkPostDAO

export namespace KlkPostDAO {
  export const codec = C.struct({
    id: KlkPostId.codec,
    url: C.string,
    title: C.string,
    episode: Maybe.codec(C.number),
    size: Maybe.codec(Size.codec),
    createdAt: DateFromISOString.codec,
    permalink: C.string,
    active: C.boolean,
  })

  export const matchesQuery =
    (query: KlkPostsQuery) =>
    (post: KlkPostDAO): boolean => {
      const matchesEpisode = maybeNumberEq.equals(
        post.episode,
        pipe(query.episode, Maybe.filter(EpisodeNumber.isNumb)),
      )
      const matchesSearch =
        Maybe.isNone(query.search) ||
        post.title.toLowerCase().match(query.search.value.toLowerCase()) !== null

      const matchesActive = eq.eqBoolean.equals(post.active, query.active)

      return matchesEpisode && matchesSearch && matchesActive
    }
}

export type KlkPostDAO = C.TypeOf<typeof KlkPostDAO.codec>

// KlkPostDAOs

export namespace KlkPostDAOs {
  export const codec = C.array(KlkPostDAO.codec) as unknown as C.Codec<
    unknown,
    List<C.OutputOf<typeof KlkPostDAO.codec>>,
    List<KlkPostDAO>
  > // TODO: cast bad
}

export type KlkPostDAOs = C.TypeOf<typeof KlkPostDAOs.codec>
