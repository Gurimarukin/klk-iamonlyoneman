import * as C from 'io-ts/lib/Codec'
import { Newtype, iso } from 'newtype-ts'

import { UuidUtils } from '../../server/utils/UuidUtils'
import { IO, List, flow, pipe } from '../utils/fp'
import { fromNewtype } from '../utils/fromNewtype'
import { StringUtils } from '../utils/StringUtils'

export type Token = Newtype<{ readonly Token: unique symbol }, string>

const isoToken = iso<Token>()

export namespace Token {
  export const wrap = isoToken.wrap
  export const unwrap = isoToken.unwrap
  export const codec = fromNewtype<Token>(C.string)

  export const generate = (): IO<Token> =>
    pipe(
      List.makeBy(2, _ => UuidUtils.uuidV4),
      List.sequence(IO.ioEither),
      IO.map(flow(StringUtils.mkString('-'), wrap)),
    )
}
