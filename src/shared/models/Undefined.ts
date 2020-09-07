import * as D from 'io-ts/Decoder'

export namespace Undefined {
  export const decoder: D.Decoder<unknown, undefined> = {
    decode: i => (i === undefined ? D.success(i) : D.failure(i, 'undefined')),
  }
}
