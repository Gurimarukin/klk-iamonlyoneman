import * as C from 'io-ts/lib/Codec'

import { Token } from './Token'

export function TokenPayload(token: Token): TokenPayload {
  return { token }
}

export namespace TokenPayload {
  export const codec = C.type({
    token: Token.codec,
  })
}

export type TokenPayload = C.TypeOf<typeof TokenPayload.codec>
