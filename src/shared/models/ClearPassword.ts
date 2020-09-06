import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../utils/fromNewtype'
import { NonEmptyString } from './NonEmptyString'

export type ClearPassword = Newtype<{ readonly ClearPassword: unique symbol }, string>

const isoClearPassword = iso<ClearPassword>()

export namespace ClearPassword {
  export const wrap = isoClearPassword.wrap
  export const unwrap = isoClearPassword.unwrap
  export const codec = fromNewtype<ClearPassword>(NonEmptyString.codec)
}
