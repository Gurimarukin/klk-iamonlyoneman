import * as C from 'io-ts/Codec'
import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../../../shared/utils/ioTsUtils'

type UserId = Newtype<{ readonly UserId: unique symbol }, string>

const { wrap, unwrap } = iso<UserId>()

const codec = fromNewtype<UserId>(C.string)

const UserId = { codec, wrap, unwrap }

export { UserId }
