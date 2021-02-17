import { Collection } from 'mongodb'

import { Future } from '../../shared/utils/fp'

export type MongoCollection = (
  collName: string,
) => <A>(f: (coll: Collection) => Promise<A>) => Future<A>
