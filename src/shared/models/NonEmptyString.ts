import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

import { pipe } from '../utils/fp'

export namespace NonEmptyString {
  export const decoder = pipe(
    D.string,
    D.parse(str => {
      const trimed = str.trim()
      return trimed === '' ? D.failure(trimed, 'non empty string') : D.success(trimed)
    }),
  )
  export const encoder: E.Encoder<string, string> = { encode: s => s }
  export const codec = C.make(decoder, encoder)
}
