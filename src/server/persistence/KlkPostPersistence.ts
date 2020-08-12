import { Collection } from 'mongodb'

import { FpCollection } from './FpCollection'
import { KlkPost } from '../models/klkPost/KlkPost'
import { KlkPostId } from '../models/klkPost/KlkPostId'
import { PartialLogger } from '../services/Logger'
import { Future, pipe } from '../../shared/utils/fp'

export type KlkPostPersistence = ReturnType<typeof KlkPostPersistence>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostPersistence(
  Logger: PartialLogger,
  mongoCollection: (dbName: string) => Future<Collection>,
) {
  const logger = Logger('KlkPostPersistence')
  const collection = FpCollection(logger, () => mongoCollection('klkPost'), KlkPost.codec)

  return {
    ensureIndexes: (): Future<void> =>
      collection.ensureIndexes([
        { key: { id: -1 }, unique: true },
        { key: { createdAt: -1 } },
        { key: { ['metadata.episode' as keyof KlkPost]: -1 } },
      ]),

    // find: (id: GuildId): Future<Maybe<KlkPost>> => collection.findOne({ id }),

    // findAll: (): Future<GuildId[]> =>
    //   pipe(
    //     collection.find({}),
    //     Future.map(_ => () => _.map(Either.map(_ => _.id)).toArray()),
    //     Future.chain(Task.map(List.array.sequence(Either.either))),
    //   ),

    upsert: (id: KlkPostId, post: KlkPost): Future<boolean> =>
      pipe(
        collection.updateOne({ id }, post, { upsert: true }),
        Future.map(_ => _.modifiedCount + _.upsertedCount === 1),
      ),
  }
}
