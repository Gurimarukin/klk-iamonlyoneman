import * as C from 'io-ts/Codec'
import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../utils/fromNewtype'

export type Token = Newtype<{ readonly Token: unique symbol }, string>

const isoToken = iso<Token>()

export namespace Token {
  export const wrap = isoToken.wrap
  export const unwrap = isoToken.unwrap
  export const codec = fromNewtype<Token>(C.string)
}
