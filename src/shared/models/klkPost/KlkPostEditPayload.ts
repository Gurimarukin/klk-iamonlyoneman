import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

import { Either, Maybe } from '../../utils/fp'
import { NonEmptyString } from '../NonEmptyString'
import { NumberFromString } from '../NumberFromString'
import { EpisodeNumber } from '../PartialKlkPostsQuery'

const emptyString: D.Decoder<unknown, ''> = pipe(
  D.string,
  D.parse(str => (str.trim() === '' ? D.success('' as const) : D.failure(str, 'EmptyString'))),
)

const orEmptyDecoder = <A>(codec: D.Decoder<unknown, A>): D.Decoder<unknown, A | ''> =>
  D.union(codec, emptyString)

type KlkPostEditPayload = D.TypeOf<typeof decoder>

type Out = {
  title: string
  url: string
  episode: string
  width: string
  height: string
  active: boolean
}

const decoder = pipe(
  D.struct({
    title: NonEmptyString.codec,
    url: NonEmptyString.codec,
    episode: orEmptyDecoder(EpisodeNumber.Numb.codec),
    width: orEmptyDecoder(NumberFromString.decoder),
    height: orEmptyDecoder(NumberFromString.decoder),
    active: D.boolean,
  }),
  D.parse(({ episode, width, height, ...rest }) => {
    const maybeEpisode = episode === '' ? Maybe.none : Maybe.some(episode)
    const eitherSize =
      width === '' && height === ''
        ? D.success(Maybe.none)
        : width !== '' && height !== ''
        ? D.success(Maybe.some({ width, height }))
        : D.failure({ width, height }, 'both properties required')
    return pipe(
      eitherSize,
      Either.map(size => ({ ...rest, episode: maybeEpisode, size })),
    )
  }),
)

const encoder: E.Encoder<Out, KlkPostEditPayload> = {
  encode: ({ episode, size, ...rest }) => ({
    ...rest,
    episode: pipe(
      episode,
      Maybe.fold(() => '', String),
    ),
    width: pipe(
      size,
      Maybe.fold(
        () => '',
        ({ width }) => `${width}`,
      ),
    ),
    height: pipe(
      size,
      Maybe.fold(
        () => '',
        ({ height }) => `${height}`,
      ),
    ),
  }),
}

const codec = C.make(decoder, encoder)

const KlkPostEditPayload = { decoder, encoder, codec }

export { KlkPostEditPayload }
