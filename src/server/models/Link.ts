import * as D from 'io-ts/lib/Decoder'

import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'

export namespace Link {
  export const decoder = D.type({
    kind: D.literal('t3'),
    data: D.type({
      id: KlkPostId.codec,
      author: D.string,
      title: D.string,
      created_utc: D.number,
      permalink: D.string,
      url: D.string,
    }),
  })
}

export type Link = D.TypeOf<typeof Link.decoder>