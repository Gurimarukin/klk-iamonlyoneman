import * as D from 'io-ts/lib/Decoder'

import { Maybe } from '../../shared/utils/fp'

import { Unknown } from '../../shared/models/Unknown'

export namespace Listing {
  export function decoder<A>(decoder: D.Decoder<unknown, A>): D.Decoder<unknown, Listing<A>> {
    return D.type({
      kind: D.literal('Listing'),
      data: D.type({
        before: Maybe.decoder(D.string),
        after: Maybe.decoder(D.string),
        dist: D.number,
        modhash: D.string,
        children: D.array(decoder),
      }),
    })
  }
}

export type Listing<A> = Readonly<{
  kind: 'Listing'
  data: {
    before: Maybe<string>
    after: Maybe<string>
    dist: number
    modhash: string
    children: A[]
  }
}>

export namespace UnknownListing {
  export const decoder = Listing.decoder(Unknown.decoder)
}

export type UnknownListing = D.TypeOf<typeof UnknownListing.decoder>
