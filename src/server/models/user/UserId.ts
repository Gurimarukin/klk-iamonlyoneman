import * as C from 'io-ts/lib/Codec'
import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../../../shared/utils/fromNewtype'

export type UserId = Newtype<{ readonly UserId: unique symbol }, string>

const isoUserId = iso<UserId>()

export namespace UserId {
  export const wrap = isoUserId.wrap
  export const unwrap = isoUserId.unwrap
  export const codec = fromNewtype<UserId>(C.string)
}
