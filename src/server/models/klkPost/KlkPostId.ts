import * as C from 'io-ts/lib/Codec'
import { Newtype, iso } from 'newtype-ts'

import { fromNewtype } from '../../../shared/utils/fromNewtype'

export type KlkPostId = Newtype<{ readonly KlkPostId: unique symbol }, string>

const isoKlkPostId = iso<KlkPostId>()

export namespace KlkPostId {
  export const wrap = isoKlkPostId.wrap
  export const unwrap = isoKlkPostId.unwrap
  export const codec = fromNewtype<KlkPostId>(C.string)
}
