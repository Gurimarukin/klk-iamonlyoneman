import * as D from 'io-ts/Decoder'

import { Unknown } from '../../shared/models/Unknown'
import { List, Maybe } from '../../shared/utils/fp'

export namespace Listing {
  export function decoder<A>(codec: D.Decoder<unknown, A>): D.Decoder<unknown, Listing<A>> {
    return D.type({
      kind: D.literal('Listing'),
      data: D.type({
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
  readonly kind: 'Listing'
  readonly data: {
    readonly before: Maybe<string>
    readonly after: Maybe<string>
    readonly dist: number
    readonly modhash: string
    readonly children: List<A>
  }
}

export namespace UnknownListing {
  export const decoder = Listing.decoder(Unknown.decoder)
}

export type UnknownListing = D.TypeOf<typeof UnknownListing.decoder>
