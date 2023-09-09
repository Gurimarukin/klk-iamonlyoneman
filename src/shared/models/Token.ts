import * as C from 'io-ts/Codec'
import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../utils/ioTsUtils'

type Token = Newtype<{ readonly Token: unique symbol }, string>

const { wrap, unwrap } = iso<Token>()

const codec = fromNewtype<Token>(C.string)

const Token = { codec, wrap, unwrap }

export { Token }
