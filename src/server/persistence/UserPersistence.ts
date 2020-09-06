import { Collection, UpdateWriteOpResult } from 'mongodb'

import { Token } from '../../shared/models/Token'
import { Future, Maybe, pipe } from '../../shared/utils/fp'
import { User } from '../models/user/User'
import { UserId } from '../models/user/UserId'
import { PartialLogger } from '../services/Logger'
import { FpCollection } from './FpCollection'

export type UserPersistence = ReturnType<typeof UserPersistence>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function UserPersistence(
  Logger: PartialLogger,
  mongoCollection: (coll: string) => <A>(f: (coll: Collection) => Promise<A>) => Future<A>,
) {
  const logger = Logger('UserPersistence')
  const collection = FpCollection(logger, mongoCollection('user'), User.codec)

  return {
    ensureIndexes: (): Future<void> =>
      collection.ensureIndexes([
        // fu prettier
        { key: { id: -1 }, unique: true },
        { key: { user: -1 }, unique: true },
        { key: { token: -1 } },
      ]),

    findByUserName: (user: string): Future<Maybe<User>> => collection.findOne({ user }),

    findByToken: (token: Token): Future<Maybe<User>> => collection.findOne({ token }),

    create: (user: User): Future<void> =>
      pipe(
        collection.insertOne(user),
        Future.map(_ => {}),
      ),

    setToken: (id: UserId, token: Token): Future<UpdateWriteOpResult> =>
      collection.collection(coll => coll.updateOne({ id }, { $set: { token } })),
  }
}
