import { eq as eq_ } from 'fp-ts'
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

import { Dict, List } from '../utils/fp'
import { NumberFromString } from './NumberFromString'

export namespace EpisodeNumber {
  export type Numb = number
  export namespace Numb {
    export const codec = NumberFromString.Bounded.codec(1, 25)
  }

  export type Unknown = 'unknown'
  export const unknown: Unknown = 'unknown'

  export const isNumb = (episode: EpisodeNumber): episode is Numb => typeof episode === 'number'

  export const decoder: D.Decoder<unknown, EpisodeNumber> = D.union(
    Numb.codec,
    D.literal('unknown'),
  )

  export const toNullable = (e: EpisodeNumber): number | null => (e === 'unknown' ? null : e)

  export const eq: Eq<EpisodeNumber> = eq_.eqStrict
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

export namespace PartialKlkPostsQuery {
  export const decoder = D.partial({
    episode: EpisodeNumber.decoder,
    search: D.string,
    sort: PostsSort.decoder,
    active: PostActive.decoder,
  })

  type Out = Partial<Record<keyof PartialKlkPostsQuery, string>>
  export const encoder: E.Encoder<Out, PartialKlkPostsQuery> = {
    encode: query =>
      pipe(
        Dict.toReadonlyArray(query as Required<PartialKlkPostsQuery>),
        List.reduce({} as Out, (acc, [key, value]) => ({ ...acc, [key]: String(value) })),
      ),
  }
}

export type PartialKlkPostsQuery = D.TypeOf<typeof PartialKlkPostsQuery.decoder>
