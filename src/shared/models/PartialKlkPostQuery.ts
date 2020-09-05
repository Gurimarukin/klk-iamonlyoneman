import * as C from 'io-ts/lib/Codec'
import * as D from 'io-ts/lib/Decoder'
import * as E from 'io-ts/lib/Encoder'

import { Dict, List, Maybe, pipe } from '../../shared/utils/fp'

const between1and25Decoder = pipe(
  D.string,
  D.parse(s => {
    const n = parseInt(s, 10)
    return isNaN(n) ? D.failure(s, 'number from string') : D.success(n)
  }),
  D.refine((n): n is number => 1 <= n, 'greater or equal to 1'),
  D.refine((n): n is number => n <= 25, 'lower or equal to 25'),
)

const between1and25 = C.make(between1and25Decoder, C.number)

export namespace EpisodeNumber {
  export type Unknown = 'unknown'
  export const unknown: Unknown = 'unknown'

  export const toNullable = (e: EpisodeNumber): number | null => (e === 'unknown' ? null : e)
}

export type EpisodeNumber = number | EpisodeNumber.Unknown

export namespace PostsSort {
  export const decoder = D.union(D.literal('new'), D.literal('old'))
}

export type PostsSort = D.TypeOf<typeof PostsSort.decoder>

export namespace PartialKlkPostQuery {
  export const decoder = D.partial({
    episode: D.union(between1and25, D.literal('unknown')),
    search: D.string,
    sort: PostsSort.decoder,
  })

  type Out = Partial<Record<keyof PartialKlkPostQuery, string>>
  export const encoder: E.Encoder<Out, PartialKlkPostQuery> = {
    encode: query =>
      pipe(
        Dict.toArray(query as Required<PartialKlkPostQuery>),
        List.reduce({} as Out, (acc, [key, value]) => ({ ...acc, [key]: String(value) })),
      ),
  }

  export const defaultSort = (episode: Maybe<EpisodeNumber>): PostsSort =>
    Maybe.isSome(episode) ? 'old' : 'new'
}

export type PartialKlkPostQuery = D.TypeOf<typeof PartialKlkPostQuery.decoder>
