import { pipe } from 'fp-ts/function'
import qs from 'qs'

import { PartialKlkPostsQuery } from '../../shared/models/PartialKlkPostsQuery'
import { Dict } from '../../shared/utils/fp'

export const routes = {
  home: (query: PartialKlkPostsQuery = {}): string => {
    const str = pipe(
      query,
      Dict.filter(isDefined),
      PartialKlkPostsQuery.encoder.encode,
      qs.stringify,
    )
    return `/${str === '' ? '' : `?${str}`}`
  },
  about: '/about',
}

function isDefined<A>(a: A | undefined): a is A {
  return a !== undefined
}
