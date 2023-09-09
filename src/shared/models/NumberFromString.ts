import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

const decoder = pipe(
  D.string,
  D.parse(str => {
    const n = parseInt(str, 10)
    return isNaN(n) ? D.failure(str, 'number from string') : D.success(n)
  }),
)
const encoder: E.Encoder<string, number> = { encode: String }

const codec = C.make(decoder, encoder)

const boundedDecoder = (a: number, b: number): D.Decoder<unknown, number> =>
  pipe(
    NumberFromString.decoder,
    D.refine((n): n is number => a <= n, `greater or equal to ${a}`),
    D.refine((n): n is number => n <= b, `lower or equal to ${b}`),
  )

const boundedCodec = (a: number, b: number): C.Codec<unknown, string, number> =>
  C.make(boundedDecoder(a, b), NumberFromString.encoder)

const Bounded = { decoder: boundedDecoder, codec: boundedCodec }

export const NumberFromString = { decoder, encoder, codec, Bounded }
