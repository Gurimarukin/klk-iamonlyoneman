import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

export namespace NumberFromString {
  export const decoder = pipe(
    D.string,
    D.parse(str => {
      const n = parseInt(str, 10)
      return isNaN(n) ? D.failure(str, 'number from string') : D.success(n)
    }),
  )
  export const encoder: E.Encoder<string, number> = { encode: String }
  export const codec = C.make(decoder, encoder)

  export namespace Bounded {
    // eslint-disable-next-line no-shadow
    export const decoder = (a: number, b: number): D.Decoder<unknown, number> =>
      pipe(
        NumberFromString.decoder,
        D.refine((n): n is number => a <= n, `greater or equal to ${a}`),
        D.refine((n): n is number => n <= b, `lower or equal to ${b}`),
      )
    // eslint-disable-next-line no-shadow
    export const codec = (a: number, b: number): C.Codec<unknown, string, number> =>
      C.make(decoder(a, b), NumberFromString.encoder)
  }
}
