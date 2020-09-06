import * as C from 'io-ts/lib/Codec'

import { ClearPassword } from './ClearPassword'

export namespace LoginPayload {
  export const codec = C.type({
    user: C.string,
    password: ClearPassword.codec,
  })
}

export type LoginPayload = C.TypeOf<typeof LoginPayload.codec>
