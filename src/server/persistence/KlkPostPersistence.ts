import { Collection } from 'mongodb'

import { Future, pipe, Either, Task, List, flow } from '../../shared/utils/fp'

import { KlkPost } from '../../shared/models/klkPost/KlkPost'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'

import { FpCollection, decodeError } from './FpCollection'
import { PartialLogger } from '../services/Logger'

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

    count: (): Future<number> => collection.count({}),

    findAll: (): Future<KlkPost[]> =>
      pipe(
        collection.collection(),
        Future.map(_ => () =>
          _.find({})
            .map(flow(KlkPost.codec.decode, Either.mapLeft(decodeError)))
            .toArray(),
        ),
        Future.chain(Task.map(List.array.sequence(Either.either))),
      ),

    findByIds: (ids: KlkPostId[]): Future<KlkPostId[]> =>
      pipe(
        collection.collection(),
        Future.map(_ => () =>
          _.find({ id: { $in: ids } }, { projection: { id: 1 } })
            .map(
              flow(
                KlkPost.onlyWithIdCodec.decode,
                Either.bimap(decodeError, _ => _.id),
              ),
            )
            .toArray(),
        ),
        Future.chain(Task.map(List.array.sequence(Either.either))),
      ),

    // find: (id: GuildId): Future<Maybe<KlkPost>> => collection.findOne({ id }),

    insertMany: (posts: KlkPost[]) => collection.insertMany(posts),

    upsert: (id: KlkPostId, post: KlkPost): Future<boolean> =>
      pipe(
        collection.updateOne({ id }, post, { upsert: true }),
        Future.map(_ => _.modifiedCount + _.upsertedCount === 1),
      ),
  }
}
