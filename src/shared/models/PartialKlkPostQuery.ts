import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

import { Dict, List } from '../../shared/utils/fp'
import { NumberFromString } from './NumberFromString'

export namespace EpisodeNumber {
  export type Numb = number
  export namespace Numb {
    export const codec = NumberFromString.Bounded.codec(1, 25)
  }

  export type Unknown = 'unknown'
  export const unknown: Unknown = 'unknown'

  export const decoder: D.Decoder<unknown, EpisodeNumber> = D.union(
    Numb.codec,
    D.literal('unknown'),
  )

  export const toNullable = (e: EpisodeNumber): number | null => (e === 'unknown' ? null : e)
}

export type EpisodeNumber = EpisodeNumber.Numb | EpisodeNumber.Unknown

export namespace PostsSort {
  export const decoder = D.union(D.literal('new'), D.literal('old'))
}

export type PostsSort = D.TypeOf<typeof PostsSort.decoder>

export namespace PostActive {
  export const decoder = D.union(D.literal('true'), D.literal('false'))
}

export type PostActive = D.TypeOf<typeof PostActive.decoder>

export namespace PartialKlkPostQuery {
  export const decoder = D.partial({
    episode: EpisodeNumber.decoder,
    search: D.string,
    sort: PostsSort.decoder,
    active: PostActive.decoder,
  })

  type Out = Partial<Record<keyof PartialKlkPostQuery, string>>
  export const encoder: E.Encoder<Out, PartialKlkPostQuery> = {
    encode: query =>
      pipe(
        Dict.toReadonlyArray(query as Required<PartialKlkPostQuery>),
        List.reduce({} as Out, (acc, [key, value]) => ({ ...acc, [key]: String(value) })),
      ),
  }
}

export type PartialKlkPostQuery = D.TypeOf<typeof PartialKlkPostQuery.decoder>
