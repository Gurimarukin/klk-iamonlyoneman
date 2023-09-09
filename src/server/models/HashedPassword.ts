import * as C from 'io-ts/Codec'
import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../../shared/utils/ioTsUtils'

type HashedPassword = Newtype<{ readonly HashedPassword: unique symbol }, string>

const { wrap, unwrap } = iso<HashedPassword>()

const codec = fromNewtype<HashedPassword>(C.string)

const HashedPassword = { codec, wrap, unwrap }

export { HashedPassword }
