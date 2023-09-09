import { pipe } from 'fp-ts/function'
import { UpdateResult } from 'mongodb'

import { Token } from '../../shared/models/Token'
import { Future, Maybe, NotUsed } from '../../shared/utils/fp'

import { LoggerGetter } from '../models/logger/LoggerGetter'
import { MongoCollectionGetter } from '../models/mongo/MongoCollection'
import { User } from '../models/user/User'
import { UserId } from '../models/user/UserId'
import { FpCollection } from './FpCollection'

export type UserPersistence = ReturnType<typeof UserPersistence>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UserPersistence(Logger: LoggerGetter, mongoCollection: MongoCollectionGetter) {
  const logger = Logger('UserPersistence')
  const collection = FpCollection(logger)([User.codec, 'User'])(mongoCollection('user'))

  const ensureIndexes: Future<NotUsed> = collection.ensureIndexes([
    { key: { id: -1 }, unique: true },
    { key: { user: -1 }, unique: true },
    { key: { token: -1 } },
  ])

  return {
    ensureIndexes,

    findByUserName: (user: string): Future<Maybe<User>> => collection.findOne({ user }),

    findByToken: (token: Token): Future<Maybe<User>> =>
      collection.findOne({ token: Token.unwrap(token) }),

    create: (user: User): Future<void> =>
      pipe(
        collection.insertOne(user),
        Future.map(() => {}),
      ),

    setToken: (id: UserId, token: Token): Future<UpdateResult> => {
      const encoded = { token: Token.unwrap(token) }
      return pipe(
        collection.collection.future(coll =>
          coll.updateOne({ id: UserId.unwrap(id) }, { $set: encoded }),
        ),
        Future.chainFirstIOEitherK(() =>
          logger.trace('Updated', JSON.stringify({ $set: encoded })),
        ),
      )
    },
  }
}
