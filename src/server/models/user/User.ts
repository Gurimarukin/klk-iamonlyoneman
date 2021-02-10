import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'

import { IO, Maybe } from '../../../shared/utils/fp'
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

  export type Output = C.OutputOf<typeof codec>

  export const create = (user: string, password: HashedPassword): IO<User> =>
    pipe(
      UuidUtils.uuidV4,
      IO.map(id => ({ id: UserId.wrap(id), user, password, token: Maybe.none })),
    )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export const canEditPost = (_user: User): boolean => true
}

export type User = C.TypeOf<typeof User.codec>
