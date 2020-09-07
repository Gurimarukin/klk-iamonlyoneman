import * as C from 'io-ts/Codec'
import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../../shared/utils/fromNewtype'

export type HashedPassword = Newtype<{ readonly HashedPassword: unique symbol }, string>

const isoHashedPassword = iso<HashedPassword>()

export namespace HashedPassword {
  export const wrap = isoHashedPassword.wrap
  export const unwrap = isoHashedPassword.unwrap
  export const codec = fromNewtype<HashedPassword>(C.string)
}
