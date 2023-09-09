import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../utils/ioTsUtils'
import { NonEmptyString } from './NonEmptyString'

type ClearPassword = Newtype<{ readonly ClearPassword: unique symbol }, string>

const { unwrap } = iso<ClearPassword>()

const codec = fromNewtype<ClearPassword>(NonEmptyString.codec)

const ClearPassword = { codec, unwrap }

export { ClearPassword }
