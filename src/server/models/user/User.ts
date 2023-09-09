import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'

import { IO, Maybe } from '../../../shared/utils/fp'

import { UuidUtils } from '../../utils/UuidUtils'
import { HashedPassword } from '../HashedPassword'
import { UserId } from './UserId'

type User = C.TypeOf<typeof codec>

const codec = C.struct({
  id: UserId.codec,
  user: C.string,
  password: HashedPassword.codec,
  token: Maybe.codec(C.string),
})

const create = (user: string, password: HashedPassword): IO<User> =>
  pipe(
    UuidUtils.uuidV4,
    IO.map(id => ({ id: UserId.wrap(id), user, password, token: Maybe.none })),
  )

const canEditPost = ({}: User): boolean => true

const User = { codec, create, canEditPost }

export { User }
