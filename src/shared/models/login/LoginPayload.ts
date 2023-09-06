import * as C from 'io-ts/Codec'

import { ClearPassword } from '../ClearPassword'
import { NonEmptyString } from '../NonEmptyString'

export namespace LoginPayload {
  export const codec = C.struct({
    user: NonEmptyString.codec,
    password: ClearPassword.codec,
  })
}

export type LoginPayload = C.TypeOf<typeof LoginPayload.codec>
