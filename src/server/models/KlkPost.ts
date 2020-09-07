import * as C from 'io-ts/Codec'
import * as E from 'io-ts/Encoder'
import { Lens as MLens } from 'monocle-ts'

import { DateFromISOString } from '../../shared/models/DateFromISOString'
import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Size } from '../../shared/models/klkPost/Size'
import { Maybe, pipe } from '../../shared/utils/fp'

// KlkPost

const episodeCodec = Maybe.codec(C.number)
const sizeCodec = Maybe.codec(Size.codec)
const titleCodec = C.string
const urlCodec = C.string
const activeCodec = C.boolean

export namespace KlkPost {
  export const onlyWithIdCodec = C.type({
    id: KlkPostId.codec,
  })

  export const onlyWithIdAndUrlCodec = pipe(
    onlyWithIdCodec,
    C.intersect(
      C.type({
        url: urlCodec,
      }),
    ),
  )

  export const codec = pipe(
    onlyWithIdAndUrlCodec,
    C.intersect(
      C.type({
        title: titleCodec,
        episode: episodeCodec,
        size: sizeCodec,
        createdAt: DateFromISOString.codec,
        permalink: C.string,
        active: activeCodec,
      }),
    ),
  )

  export type Output = C.OutputOf<typeof codec>

  export namespace Lens {
    export const size = MLens.fromPath<KlkPost>()(['size'])
  }
}

export type KlkPost = C.TypeOf<typeof KlkPost.codec>

export type OnlyWithIdAndUrlKlkPost = C.TypeOf<typeof KlkPost.onlyWithIdAndUrlCodec>

// KlkPosts

export namespace KlkPosts {
  export const codec = C.array(KlkPost.codec)
}

export type KlkPosts = C.TypeOf<typeof KlkPosts.codec>

// KlkPostEditPayload

type Out = Readonly<
  {
    [K in keyof KlkPostEditPayload]: KlkPost.Output[K]
  }
>
export const klkPostEditPayloadEncoder: E.Encoder<Out, KlkPostEditPayload> = {
  encode: ({ episode, size, title, url, active }) => ({
    episode: episodeCodec.encode(episode),
    size: sizeCodec.encode(size),
    title: titleCodec.encode(title),
    url: urlCodec.encode(url),
    active: activeCodec.encode(active),
  }),
}
