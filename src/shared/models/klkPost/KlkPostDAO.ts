import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'

import { List, Maybe } from '../../utils/fp'
import { DateFromISOString } from '../DateFromISOString'
import { PartialKlkPostQuery } from '../PartialKlkPostQuery'
import { KlkPostId } from './KlkPostId'
import { Size } from './Size'

// KlkPostDAO

export namespace KlkPostDAO {
  export const codec = C.type({
    id: KlkPostId.codec,
    url: C.string,
    title: C.string,
    episode: Maybe.codec(C.number),
    size: Maybe.codec(Size.codec),
    createdAt: DateFromISOString.codec,
    permalink: C.string,
    active: C.boolean,
  })

  export const matchesQuery = (query: PartialKlkPostQuery) => (post: KlkPostDAO): boolean => {
    const matchesEpisode =
      query.episode === undefined || query.episode === 'unknown'
        ? Maybe.isNone(post.episode)
        : pipe(
            post.episode,
            Maybe.exists(e => e === query.episode),
          )
    const matchesSearch =
      query.search === undefined ||
      post.title.toLowerCase().match(query.search.toLowerCase()) !== null
    const matchesActive = post.active === (query.active !== 'false')

    return matchesEpisode && matchesSearch && matchesActive
  }
}

export type KlkPostDAO = C.TypeOf<typeof KlkPostDAO.codec>

// KlkPostDAOs

export namespace KlkPostDAOs {
  export const codec = (C.array(KlkPostDAO.codec) as unknown) as C.Codec<
    unknown,
    List<C.OutputOf<typeof KlkPostDAO.codec>>,
    List<KlkPostDAO>
  > // TODO: cast bad
}

export type KlkPostDAOs = C.TypeOf<typeof KlkPostDAOs.codec>
