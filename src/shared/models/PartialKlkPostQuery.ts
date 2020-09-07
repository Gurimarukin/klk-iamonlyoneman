import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

import { Dict, List, Maybe, pipe } from '../../shared/utils/fp'
import { NumberFromString } from './NumberFromString'

export namespace EpisodeNumber {
  export type Number = number
  export namespace Number {
    export const codec = NumberFromString.Bounded.codec(1, 25)
  }

  export type Unknown = 'unknown'
  export const unknown: Unknown = 'unknown'

  export const decoder: D.Decoder<unknown, EpisodeNumber> = D.union(
    Number.codec,
    D.literal('unknown'),
  )

  export const toNullable = (e: EpisodeNumber): number | null => (e === 'unknown' ? null : e)
}

export type EpisodeNumber = EpisodeNumber.Number | EpisodeNumber.Unknown

export namespace PostsSort {
  export const decoder = D.union(D.literal('new'), D.literal('old'))
}

export type PostsSort = D.TypeOf<typeof PostsSort.decoder>

export namespace PartialKlkPostQuery {
  export const decoder = D.partial({
    episode: EpisodeNumber.decoder,
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
