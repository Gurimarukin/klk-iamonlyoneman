import * as D from 'io-ts/lib/Decoder'

import { Maybe } from '../../shared/utils/fp'
import { Unknown } from '../../shared/models/Unknown'

export namespace Listing {
  export const decoder = D.type({
    kind: D.literal('Listing'),
    data: D.type({
      before: Maybe.decoder(D.string),
      after: Maybe.decoder(D.string),
      dist: D.number,
      modhash: D.string,
      children: D.array(Unknown.decoder),
    }),
  })
}

export type Listing = D.TypeOf<typeof Listing.decoder>
