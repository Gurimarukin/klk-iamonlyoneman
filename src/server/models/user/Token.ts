import * as C from 'io-ts/lib/Codec'
import { Newtype, iso } from 'newtype-ts'

import { IO, List, flow, pipe } from '../../../shared/utils/fp'
import { fromNewtype } from '../../../shared/utils/fromNewtype'
import { StringUtils } from '../../../shared/utils/StringUtils'
import { UuidUtils } from '../../utils/UuidUtils'

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
