import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'

export namespace Link {
  export const decoder = D.type({
    kind: D.literal('t3'),
    data: pipe(
      D.type({
        id: KlkPostId.codec,
        subreddit_name_prefixed: D.string,
        author: D.string,
        title: D.string,
        created_utc: D.number,
        permalink: D.string,
        url: D.string,
      }),
      D.intersect(
        D.partial({
          post_hint: D.string,
        }),
      ),
    ),
  })
}

export type Link = D.TypeOf<typeof Link.decoder>
