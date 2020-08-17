import { Maybe } from '../../../shared/utils/fp'

import { Link } from './Link'

export type LinksListing = Readonly<{
  kind: 'Listing'
  data: {
    before: Maybe<string>
    after: Maybe<string>
    dist: number
    modhash: string
    children: Link[]
  }
}>
