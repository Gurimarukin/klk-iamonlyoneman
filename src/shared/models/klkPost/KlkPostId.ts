import * as C from 'io-ts/Codec'
import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../../utils/ioTsUtils'

type KlkPostId = Newtype<{ readonly KlkPostId: unique symbol }, string>

const { wrap, unwrap } = iso<KlkPostId>()

const codec = fromNewtype<KlkPostId>(C.string)

const KlkPostId = { codec, wrap, unwrap }

export { KlkPostId }
