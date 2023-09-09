import * as D from 'io-ts/Decoder'

const decoder: D.Decoder<unknown, undefined> = {
  decode: i => (i === undefined ? D.success(i) : D.failure(i, 'undefined')),
}

export const Undefined = { decoder }
