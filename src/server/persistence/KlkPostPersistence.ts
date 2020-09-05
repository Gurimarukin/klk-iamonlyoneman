import { Collection } from 'mongodb'

import { KlkPost, OnlyWithIdAndUrlKlkPost } from '../../shared/models/klkPost/KlkPost'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Size } from '../../shared/models/klkPost/Size'
import { Either, Future, List, Maybe, Task, flow, pipe } from '../../shared/utils/fp'
import { PartialLogger } from '../services/Logger'
import { FpCollection, decodeError } from './FpCollection'

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
        { key: { episode: -1 } },
      ]),

    count: (): Future<number> => collection.count({}),

    findByEpisode: (episode: Maybe<number>): Future<KlkPost[]> =>
      pipe(
        collection.collection(coll =>
          coll
            .find({ episode: Maybe.toNullable(episode) })
            .sort([
              ['episode', 1],
              ['createdAt', 1],
            ])
            .map(flow(KlkPost.codec.decode, Either.mapLeft(decodeError)))
            .toArray(),
        ),
        Future.chain(flow(List.array.sequence(Either.either), Task.of)),
      ),

    findWithEmptySize: (): Future<OnlyWithIdAndUrlKlkPost[]> =>
      pipe(
        collection.collection(coll =>
          coll
            .find({ size: null }, { projection: { id: 1, url: 1 } })
            .map(flow(KlkPost.onlyWithIdAndUrlCodec.decode, Either.mapLeft(decodeError)))
            .toArray(),
        ),
        Future.chain(flow(List.array.sequence(Either.either), Task.of)),
      ),

    findByIds: (ids: KlkPostId[]): Future<KlkPostId[]> =>
      pipe(
        collection.collection(coll =>
          coll
            .find({ id: { $in: ids } }, { projection: { id: 1 } })
            .map(
              flow(
                KlkPost.onlyWithIdCodec.decode,
                Either.bimap(decodeError, p => p.id),
              ),
            )
            .toArray(),
        ),
        Future.chain(flow(List.array.sequence(Either.either), Task.of)),
      ),

    // find: (id: GuildId): Future<Maybe<KlkPost>> => collection.findOne({ id }),

    updateSizeById: (id: KlkPostId, size: Size): Future<boolean> =>
      pipe(
        collection.collection(coll => coll.updateOne({ id: id }, { $set: { size } })),
        Future.map(r => r.modifiedCount === 1),
      ),

    insertMany: (posts: KlkPost[]) => collection.insertMany(posts),

    upsert: (id: KlkPostId, post: KlkPost): Future<boolean> =>
      pipe(
        collection.updateOne({ id }, post, { upsert: true }),
        Future.map(_ => _.modifiedCount + _.upsertedCount === 1),
      ),
  }
}
