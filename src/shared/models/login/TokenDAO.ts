import * as C from 'io-ts/Codec'

import { Token } from '../Token'

type TokenDAO = C.TypeOf<typeof codec>

const codec = C.struct({
  token: Token.codec,
})

function of(token: Token): TokenDAO {
  return { token }
}

const TokenDAO = { codec, of }

export { TokenDAO }
