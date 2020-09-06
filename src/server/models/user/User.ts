import * as C from 'io-ts/lib/Codec'

import { IO, Maybe, pipe } from '../../../shared/utils/fp'
import { UuidUtils } from '../../utils/UuidUtils'
import { HashedPassword } from '../HashedPassword'
import { UserId } from './UserId'

export namespace User {
  export const codec = C.type({
    id: UserId.codec,
    user: C.string,
    password: HashedPassword.codec,
    token: Maybe.codec(C.string),
  })

  export const create = (user: string, password: HashedPassword): IO<User> =>
    pipe(
      UuidUtils.uuidV4,
      IO.map(id => ({ id: UserId.wrap(id), user, password, token: Maybe.none })),
    )
}

export type User = C.TypeOf<typeof User.codec>
