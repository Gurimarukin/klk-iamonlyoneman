import * as C from 'io-ts/Codec'

import { Token } from '../Token'

export function TokenDAO(token: Token): TokenDAO {
  return { token }
}

export namespace TokenDAO {
  export const codec = C.type({
    token: Token.codec,
  })
}

export type TokenDAO = C.TypeOf<typeof TokenDAO.codec>
