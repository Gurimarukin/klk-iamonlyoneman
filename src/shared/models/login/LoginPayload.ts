import * as C from 'io-ts/Codec'

import { ClearPassword } from '../ClearPassword'
import { NonEmptyString } from '../NonEmptyString'

type LoginPayload = C.TypeOf<typeof codec>

const codec = C.struct({
  user: NonEmptyString.codec,
  password: ClearPassword.codec,
})

const LoginPayload = { codec }

export { LoginPayload }
