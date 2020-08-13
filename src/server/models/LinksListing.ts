import { Link } from './Link'
import { Maybe } from '../../shared/utils/fp'

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
