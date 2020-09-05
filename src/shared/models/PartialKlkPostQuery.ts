import * as D from 'io-ts/lib/Decoder'

import { Maybe, pipe } from '../../shared/utils/fp'

const between1and25 = pipe(
  D.string,
  D.parse(s => {
    const n = parseInt(s, 10)
    return isNaN(n) ? D.failure(s, 'number from string') : D.success(n)
  }),
  D.refine((n): n is number => 1 <= n, 'greater or equal to 1'),
  D.refine((n): n is number => n <= 25, 'lower or equal to 25'),
)

export namespace PartialKlkPostQuery {
  export const decoder = D.partial({
    episode: Maybe.decoder(between1and25),
    search: D.string,
    sort: D.union(D.literal('new'), D.literal('old')),
  })
}

export type PartialKlkPostQuery = D.TypeOf<typeof PartialKlkPostQuery.decoder>
