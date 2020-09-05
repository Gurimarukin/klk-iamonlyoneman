import * as C from 'io-ts/lib/Codec'
import { Lens as MLens } from 'monocle-ts'

import { Maybe, pipe } from '../../utils/fp'
import { DateFromISOString } from '../DateFromISOString'
import { KlkPostId } from './KlkPostId'
import { Size } from './Size'

// KlkPost

export namespace KlkPost {
  export const onlyWithIdCodec = C.type({
    id: KlkPostId.codec,
  })

  const urlCodec = C.type({
    url: C.string,
  })

  export const onlyWithIdAndUrlCodec = pipe(onlyWithIdCodec, C.intersect(urlCodec))

  export const codec = pipe(
    onlyWithIdAndUrlCodec,
    C.intersect(
      C.type({
        title: C.string,
        episode: Maybe.codec(C.number),
        size: Maybe.codec(Size.codec),
        createdAt: DateFromISOString.codec,
        permalink: C.string,
      }),
    ),
  )

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
