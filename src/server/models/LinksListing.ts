import { Link } from './Link'
import { Listing } from './Listing'

export type LinksListing = Listing &
  Readonly<{
    data: Readonly<{
      children: Link[]
    }>
  }>
