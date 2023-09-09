import { apply } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import readline from 'readline'

import { ClearPassword } from '../../shared/models/ClearPassword'
import { Token } from '../../shared/models/Token'
import { LoginPayload } from '../../shared/models/login/LoginPayload'
import { Either, Future, IO, List, Maybe, NotUsed, toNotUsed } from '../../shared/utils/fp'

import { LoggerGetter } from '../models/logger/LoggerGetter'
import { User } from '../models/user/User'
import { UserPersistence } from '../persistence/UserPersistence'
import { PasswordUtils } from '../utils/PasswordUtils'
import { UuidUtils } from '../utils/UuidUtils'

export type UserService = ReturnType<typeof UserService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UserService(Logger: LoggerGetter, userPersistence: UserPersistence) {
  const logger = Logger('UserService')

  return {
    login: (userName: string, clearPassword: ClearPassword): Future<Maybe<Token>> =>
      pipe(
        userPersistence.findByUserName(userName),
        Future.chain(
          Maybe.fold(
            () => Future.successful(Maybe.none),
            ({ id, password }) =>
              pipe(
                PasswordUtils.check(password, clearPassword),
                Future.chain(ok =>
                  ok
                    ? pipe(
                        generateToken,
                        Future.fromIOEither,
                        Future.chain(token =>
                          pipe(
                            userPersistence.setToken(id, token),
                            Future.map(() => Maybe.some(token)),
                          ),
                        ),
                      )
                    : Future.successful(Maybe.none),
                ),
              ),
          ),
        ),
      ),

    findByToken: (token: Token): Future<Maybe<User>> => userPersistence.findByToken(token),

    createUser: createUser(),
  }

  function createUser(): Future<NotUsed> {
    return pipe(
      logger.info('Creating user'),
      Future.fromIOEither,
      Future.chain(() =>
        apply.sequenceT(Future.ApplicativeSeq)(
          prompt('name: '),
          prompt('password: '),
          prompt('confirm password: '),
        ),
      ),
      Future.chain(([user, password, confirm]) =>
        password !== confirm
          ? Future.failed(Error('Passwords must be the same'))
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
      Future.map(toNotUsed),
    )
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

const generateToken: IO<Token> = pipe(
  List.makeBy(2, () => UuidUtils.uuidV4),
  IO.sequenceArray,
  IO.map(flow(List.mkString('-'), Token.wrap)),
)
