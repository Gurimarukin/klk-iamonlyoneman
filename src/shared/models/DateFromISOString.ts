import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E from 'io-ts/Encoder'

export namespace DateFromISOString {
  export const decoder: D.Decoder<unknown, Date> = pipe(
    D.string,
    D.parse(s => {
      const d = new Date(s)
      return isNaN(d.getTime())
        ? D.failure(s, `cannot decode ${JSON.stringify(s)}, should be parsable into a Date`)
        : D.success(d)
    }),
  )

  export const encoder: E.Encoder<string, Date> = {
    encode: _ => _.toISOString(),
  }

  export const codec: C.Codec<unknown, string, Date> = C.make(decoder, encoder)
}
