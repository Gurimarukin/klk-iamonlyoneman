import { pipe } from 'fp-ts/function'
import { UpdateWriteOpResult } from 'mongodb'

import { Token } from '../../shared/models/Token'
import { Future, Maybe } from '../../shared/utils/fp'

import { MongoCollection } from '../models/MongoCollection'
import { User } from '../models/user/User'
import { UserId } from '../models/user/UserId'
import { PartialLogger } from '../services/Logger'
import { FpCollection } from './FpCollection'

export type UserPersistence = ReturnType<typeof UserPersistence>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UserPersistence(Logger: PartialLogger, mongoCollection: MongoCollection) {
  const logger = Logger('UserPersistence')
  const collection = FpCollection<User, User.Output>(logger, mongoCollection('user'), User.codec)

  return {
    ensureIndexes: (): Future<void> =>
      collection.ensureIndexes([
        // fu prettier
        { key: { id: -1 }, unique: true },
        { key: { user: -1 }, unique: true },
        { key: { token: -1 } },
      ]),

    findByUserName: (user: string): Future<Maybe<User>> => collection.findOne({ user }),

    findByToken: (token: Token): Future<Maybe<User>> =>
      collection.findOne({ token: Token.unwrap(token) }),

    create: (user: User): Future<void> =>
      pipe(
        collection.insertOne(user),
        Future.map(() => {}),
      ),

    setToken: (id: UserId, token: Token): Future<UpdateWriteOpResult> =>
      collection.collection(coll =>
        coll.updateOne({ id: UserId.unwrap(id) }, { $set: { token: Token.unwrap(token) } }),
      ),
  }
}
