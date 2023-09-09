import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

const decoder = pipe(
  D.string,
  D.parse(str => {
    const trimed = str.trim()
    return trimed === '' ? D.failure(trimed, 'non empty string') : D.success(trimed)
  }),
)

const encoder: E.Encoder<string, string> = { encode: s => s }

const codec = C.make(decoder, encoder)

export const NonEmptyString = { decoder, encoder, codec }
