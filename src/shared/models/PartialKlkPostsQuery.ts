import { eq as eq_ } from 'fp-ts'
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

import { Dict, List } from '../utils/fp'
import { NumberFromString } from './NumberFromString'

type EpisodeNumber = EpisodeNumberNumb | EpisodeNumberUnknown

type EpisodeNumberNumb = number

const episodeNumberNumbCodec = NumberFromString.Bounded.codec(1, 25)

type EpisodeNumberUnknown = 'unknown'

const episodeNumberUnknown: EpisodeNumberUnknown = 'unknown'

const episodeNumberDecoder: D.Decoder<unknown, EpisodeNumber> = D.union(
  episodeNumberNumbCodec,
  D.literal('unknown'),
)

const isNumb = (episode: EpisodeNumber): episode is EpisodeNumberNumb => typeof episode === 'number'

const toNullable = (e: EpisodeNumber): number | null => (e === 'unknown' ? null : e)

const episodeNumberEq: Eq<EpisodeNumber> = eq_.eqStrict

const EpisodeNumber = {
  unknown: episodeNumberUnknown,
  decoder: episodeNumberDecoder,
  isNumb,
  toNullable,
  Eq: episodeNumberEq,
  Numb: {
    codec: episodeNumberNumbCodec,
  },
}

type PostsSort = D.TypeOf<typeof postsSortDecoder>

const postsSortDecoder = D.union(D.literal('new'), D.literal('old'))

const PostsSort = { decoder: postsSortDecoder }

type PostActive = D.TypeOf<typeof postActiveDecoder>

const postActiveDecoder = D.union(D.literal('true'), D.literal('false'))

const PostActive = { decoder: postActiveDecoder }

type PartialKlkPostsQuery = D.TypeOf<typeof partialKlkPostsQueryDecoder>
type PartialKlkPostsQueryOut = Partial<Record<keyof PartialKlkPostsQuery, string>>

const partialKlkPostsQueryDecoder = D.partial({
  episode: EpisodeNumber.decoder,
  search: D.string,
  sort: PostsSort.decoder,
  active: PostActive.decoder,
})

const partialKlkPostsQueryEncoder: E.Encoder<PartialKlkPostsQueryOut, PartialKlkPostsQuery> = {
  encode: query =>
    pipe(
      Dict.toReadonlyArray(query as Required<PartialKlkPostsQuery>),
      List.reduce({} as PartialKlkPostsQueryOut, (acc, [key, value]) => ({
        ...acc,
        [key]: String(value),
      })),
    ),
}

const PartialKlkPostsQuery = {
  decoder: partialKlkPostsQueryDecoder,
  encoder: partialKlkPostsQueryEncoder,
}

export { EpisodeNumber, PartialKlkPostsQuery, PostActive, PostsSort }
