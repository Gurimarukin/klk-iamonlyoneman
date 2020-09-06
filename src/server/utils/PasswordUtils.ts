import { ClearPassword } from '../../shared/models/ClearPassword'
import { Future, pipe } from '../../shared/utils/fp'
import { HashedPassword } from '../models/HashedPassword'

const argon2 = require('@phc/argon2')
const upash = require('upash')

upash.install('argon2', argon2)

export namespace PasswordUtils {
  export const hash = (clearPassword: ClearPassword): Future<HashedPassword> =>
    pipe(
      Future.apply(() => upash.hash(clearPassword) as Promise<string>),
      Future.map(HashedPassword.wrap),
    )

  export const check = (
    hashedPassword: HashedPassword,
    clearPassword: ClearPassword,
  ): Future<boolean> =>
    Future.apply(() =>
      upash.verify(HashedPassword.unwrap(hashedPassword), ClearPassword.unwrap(clearPassword)),
    )
}
