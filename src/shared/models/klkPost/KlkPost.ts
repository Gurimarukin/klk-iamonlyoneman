import * as C from 'io-ts/lib/Codec'

import { Maybe, pipe } from '../../utils/fp'

import { KlkPostId } from './KlkPostId'
import { DateFromISOString } from '../DateFromISOString'
import { Size } from './Size'

// KlkPost

export namespace KlkPost {
  export const onlyWithIdCodec = C.type({
    id: KlkPostId.codec,
  })

  export const codec = pipe(
    onlyWithIdCodec,
    C.intersect(
      C.type({
        title: C.string,
        episode: Maybe.codec(C.number),
        size: Maybe.codec(Size.codec),
        createdAt: DateFromISOString.codec,
        permalink: C.string,
        url: C.string,
      }),
    ),
  )
}

export type KlkPost = C.TypeOf<typeof KlkPost.codec>

// KlkPosts

export namespace KlkPosts {
  export const codec = C.array(KlkPost.codec)
}

export type KlkPosts = C.TypeOf<typeof KlkPosts.codec>
