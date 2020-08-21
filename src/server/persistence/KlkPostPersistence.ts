import { Collection } from 'mongodb'

import { Either, Future, List, Task, flow, pipe } from '../../shared/utils/fp'

import { KlkPost } from '../../shared/models/klkPost/KlkPost'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'

import { FpCollection, decodeError } from './FpCollection'
import { PartialLogger } from '../services/Logger'

export type KlkPostPersistence = ReturnType<typeof KlkPostPersistence>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostPersistence(
  Logger: PartialLogger,
  mongoCollection: (coll: string) => <A>(f: (coll: Collection) => Promise<A>) => Future<A>,
) {
  const logger = Logger('KlkPostPersistence')
  const collection = FpCollection(logger, mongoCollection('klkPost'), KlkPost.codec)

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
        collection.collection(c =>
          c
            .find({})
            .sort({ 'metadata.episode': 1, createdAt: 1 })
            .map(flow(KlkPost.codec.decode, Either.mapLeft(decodeError)))
            .toArray(),
        ),
        Future.chain(flow(List.array.sequence(Either.either), Task.of)),
      ),

    findByIds: (ids: KlkPostId[]): Future<KlkPostId[]> =>
      pipe(
        collection.collection(_ =>
          _.find({ id: { $in: ids } }, { projection: { id: 1 } })
            .map(
              flow(
                KlkPost.onlyWithIdCodec.decode,
                Either.bimap(decodeError, _ => _.id),
              ),
            )
            .toArray(),
        ),
        Future.chain(flow(List.array.sequence(Either.either), Task.of)),
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
