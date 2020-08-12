import * as D from 'io-ts/lib/Decoder'

import { Either } from '../utils/fp'

export namespace Unknown {
  export const decoder: D.Decoder<unknown, unknown> = {
    decode: Either.right,
  }
}
