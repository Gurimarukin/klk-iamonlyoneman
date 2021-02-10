import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

import { Either, Maybe } from '../../utils/fp'
import { NonEmptyString } from '../NonEmptyString'
import { NumberFromString } from '../NumberFromString'
import { EpisodeNumber } from '../PartialKlkPostQuery'

const emptyString: D.Decoder<unknown, ''> = pipe(
  D.string,
  D.parse(str => (str.trim() === '' ? D.success('') : D.failure(str, 'EmptyString'))),
)

namespace OrEmpty {
  export const decoder = <A>(codec: D.Decoder<unknown, A>): D.Decoder<unknown, A | ''> =>
    D.union(codec, emptyString)
  export const codec = <A>(c: C.Codec<unknown, string, A>): C.Codec<unknown, string, A | ''> =>
    C.make(decoder(c), { encode: String })
}

export namespace KlkPostEditPayload {
  export const decoder = pipe(
    D.type({
      title: NonEmptyString.codec,
      url: NonEmptyString.codec,
      episode: OrEmpty.decoder(EpisodeNumber.Numb.codec),
      width: OrEmpty.decoder(NumberFromString.decoder),
      height: OrEmpty.decoder(NumberFromString.decoder),
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
  export const codec = C.make(decoder, encoder)
}

export type KlkPostEditPayload = D.TypeOf<typeof KlkPostEditPayload.decoder>
type Out = {
  readonly title: string
  readonly url: string
  readonly episode: string
  readonly width: string
  readonly height: string
  readonly active: boolean
}
