import { apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import readline from 'readline'

import { ClearPassword } from '../../shared/models/ClearPassword'
import { Token } from '../../shared/models/Token'
import { LoginPayload } from '../../shared/models/login/LoginPayload'
import { Either, Future, Maybe } from '../../shared/utils/fp'

import { User } from '../models/user/User'
import { UserPersistence } from '../persistence/UserPersistence'
import { PasswordUtils } from '../utils/PasswordUtils'
import { PartialLogger } from './Logger'

export type UserService = ReturnType<typeof UserService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UserService(Logger: PartialLogger, userPersistence: UserPersistence) {
  const logger = Logger('UserService')

  return {
    login: (userName: string, clearPassword: ClearPassword): Future<Maybe<Token>> =>
      pipe(
        userPersistence.findByUserName(userName),
        Future.chain(
          Maybe.fold(
            () => Future.right(Maybe.none),
            ({ id, password }) =>
              pipe(
                PasswordUtils.check(password, clearPassword),
                Future.chain(ok =>
                  ok
                    ? pipe(
                        Token.generate(),
                        Future.fromIOEither,
                        Future.chain(token =>
                          pipe(
                            userPersistence.setToken(id, token),
                            Future.map(() => Maybe.some(token)),
                          ),
                        ),
                      )
                    : Future.right(Maybe.none),
                ),
              ),
          ),
        ),
      ),

    findByToken: (token: Token): Future<Maybe<User>> => userPersistence.findByToken(token),

    createUser: (): Future<void> =>
      pipe(
        logger.info('Creating user'),
        Future.fromIOEither,
        Future.chain(() =>
          apply.sequenceT(Future.taskEitherSeq)(
            prompt('name: '),
            prompt('password: '),
            prompt('confirm password: '),
          ),
        ),
        Future.chain(([user, password, confirm]) =>
          password !== confirm
            ? Future.left(Error('Passwords must be the same'))
            : pipe(
                decodeFuture(LoginPayload.codec.decode)({ user, password }),
                Future.chain(({ user: user_, password: password_ }) =>
                  pipe(
                    PasswordUtils.hash(password_),
                    Future.chain(hashed => Future.fromIOEither(User.create(user_, hashed))),
                    Future.chain(userPersistence.create),
                  ),
                ),
              ),
        ),
      ),
  }
}

function prompt(label: string): Future<string> {
  return pipe(
    Future.tryCatch(() => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      return new Promise<string>(resolve => rl.question(label, answer => resolve(answer))).then(
        res => {
          // eslint-disable-next-line functional/no-expression-statements
          rl.close()
          return res
        },
      )
    }),
  )
}

function decodeFuture<A>(
  decode: (i: unknown) => Either<D.DecodeError, A>,
): (i: unknown) => Future<A> {
  return i =>
    pipe(
      decode(i),
      Either.mapLeft(e => Error(`Couldn't decode answer:\n${D.draw(e)}`)),
      Future.fromEither,
    )
}
