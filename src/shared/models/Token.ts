import { flow, pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import { iso, Newtype } from 'newtype-ts'

import { UuidUtils } from '../../server/utils/UuidUtils'
import { IO, List } from '../utils/fp'
import { fromNewtype } from '../utils/fromNewtype'

export type Token = Newtype<{ readonly Token: unique symbol }, string>

const isoToken = iso<Token>()

export namespace Token {
  export const wrap = isoToken.wrap
  export const unwrap = isoToken.unwrap
  export const codec = fromNewtype<Token>(C.string)

  export const generate = (): IO<Token> =>
    pipe(
      List.makeBy(2, () => UuidUtils.uuidV4),
      IO.sequenceArray,
      IO.map(flow(List.mkString('-'), wrap)),
    )
}
