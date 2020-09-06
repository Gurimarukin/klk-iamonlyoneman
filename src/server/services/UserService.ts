import readline from 'readline'

import * as D from 'io-ts/Decoder'

import { ClearPassword } from '../../shared/models/ClearPassword'
import { Do, Either, Future, IO, Maybe, flow, pipe } from '../../shared/utils/fp'
import { Token } from '../models/user/Token'
import { User } from '../models/user/User'
import { UserPersistence } from '../persistence/UserPersistence'
import { PasswordUtils } from '../utils/PasswordUtils'
import { PartialLogger } from './Logger'

const nonEmptyStringDecoder = pipe(
  D.string,
  D.parse(str => {
    const trimed = str.trim()
    return trimed === '' ? D.failure(trimed, 'non empty string') : D.success(trimed)
  }),
)

const clearPasswordDecoder = pipe(nonEmptyStringDecoder, D.map(ClearPassword.wrap))

export type UserService = ReturnType<typeof UserService>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function UserService(Logger: PartialLogger, userPersistence: UserPersistence) {
  const _logger = Logger('UserService')

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
                            Future.map(_ => Maybe.some(token)),
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
        Do(Future.taskEither)
          .do(Future.fromIOEither(IO.apply(() => console.log('Creating user'))))
          .bind('name', prompt('name: ', nonEmptyStringDecoder))
          .bind('password', prompt('password: ', clearPasswordDecoder))
          .bind('confirm', prompt('confirm password: ', clearPasswordDecoder))
          .done(),
        Future.chain(({ name, password, confirm }) =>
          password !== confirm
            ? Future.left(Error('Passwords must be the same'))
            : pipe(
                PasswordUtils.hash(password),
                Future.chain(hashed => Future.fromIOEither(User.create(name, hashed))),
                Future.chain(userPersistence.create),
              ),
        ),
      ),
  }
}

function prompt<A>(label: string, decoder: D.Decoder<string, A>): Future<A> {
  return pipe(
    Future.apply(() => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      return new Promise<string>(resolve => rl.question(label, answer => resolve(answer))).then(
        res => {
          rl.close()
          return res
        },
      )
    }),
    Future.chain(
      flow(
        decoder.decode,
        Either.mapLeft(e => Error(`Couldn't decode answer:\n${D.draw(e)}`)),
        Future.fromEither,
      ),
    ),
  )
}
