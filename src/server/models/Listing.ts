import * as D from 'io-ts/Decoder'

import { Unknown } from '../../shared/models/Unknown'
import { List, Maybe } from '../../shared/utils/fp'

export namespace Listing {
  export function decoder<A>(codec: D.Decoder<unknown, A>): D.Decoder<unknown, Listing<A>> {
    return D.struct({
      kind: D.literal('Listing'),
      data: D.struct({
        before: Maybe.decoder(D.string),
        after: Maybe.decoder(D.string),
        dist: D.number,
        modhash: D.string,
        children: D.array(codec),
      }),
    })
  }
}

export type Listing<A> = {
  kind: 'Listing'
  data: {
    before: Maybe<string>
    after: Maybe<string>
    dist: number
    modhash: string
    children: List<A>
  }
}

export namespace UnknownListing {
  export const decoder = Listing.decoder(Unknown.decoder)
}

export type UnknownListing = D.TypeOf<typeof UnknownListing.decoder>
