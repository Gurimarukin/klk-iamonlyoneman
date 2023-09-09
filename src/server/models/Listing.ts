import * as D from 'io-ts/Decoder'

import { List, Maybe } from '../../shared/utils/fp'

type Listing<A> = {
  kind: 'Listing'
  data: {
    before: Maybe<string>
    after: Maybe<string>
    dist: number
    modhash: string
    children: List<A>
  }
}

function decoder<A>(codec: D.Decoder<unknown, A>): D.Decoder<unknown, Listing<A>> {
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

const Listing = { decoder }

type UnknownListing = D.TypeOf<typeof unknownListingDecoder>

const unknownListingDecoder = Listing.decoder(D.id<unknown>())

const UnknownListing = { decoder: unknownListingDecoder }

export { Listing, UnknownListing }
