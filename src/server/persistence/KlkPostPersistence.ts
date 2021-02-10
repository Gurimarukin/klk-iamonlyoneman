import { flow, pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import { Collection, Cursor, FilterQuery } from 'mongodb'

import { config } from '../../shared/config'
import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Size } from '../../shared/models/klkPost/Size'
import { EpisodeNumber } from '../../shared/models/PartialKlkPostQuery'
import { Either, Future, List, Maybe, Task } from '../../shared/utils/fp'
import { KlkPost, OnlyWithIdAndUrlKlkPost, klkPostEditPayloadEncoder } from '../models/KlkPost'
import { KlkPostsQuery } from '../models/KlkPostsQuery'
import { PartialLogger } from '../services/Logger'
import { FpCollection, decodeError } from './FpCollection'

export type KlkPostPersistence = ReturnType<typeof KlkPostPersistence>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function KlkPostPersistence(
  Logger: PartialLogger,
  mongoCollection: (collName: string) => <A>(f: (coll: Collection) => Promise<A>) => Future<A>,
) {
  const logger = Logger('KlkPostPersistence')
  const collection = FpCollection<KlkPost, KlkPost.Output>(
    logger,
    mongoCollection('klkPost'),
    KlkPost.codec,
  )

  type OutputType = C.OutputOf<typeof KlkPost.codec>

  return {
    ensureIndexes: (): Future<void> =>
      collection.ensureIndexes([
        { key: { id: -1 }, unique: true },
        { key: { createdAt: -1 } },
        { key: { episode: -1 } },
        { key: { title: 'text' } },
      ]),

    count: (): Future<number> => collection.count({}),

    findAll: (query: KlkPostsQuery, page: number): Future<List<KlkPost>> =>
      pipe(
        collection.collection(coll =>
          cursorFromQueryParams(coll, query, page)
            .map(flow(KlkPost.codec.decode, Either.mapLeft(decodeError)))
            .toArray(),
        ),
        Future.chain(flow(Either.sequenceArray, Task.of)),
      ),

    findWithEmptySize: (): Future<List<OnlyWithIdAndUrlKlkPost>> =>
      pipe(
        collection.collection(coll =>
          coll
            .find({ size: null }, { projection: { id: 1, url: 1 } })
            .map(flow(KlkPost.onlyWithIdAndUrlCodec.decode, Either.mapLeft(decodeError)))
            .toArray(),
        ),
        Future.chain(flow(Either.sequenceArray, Task.of)),
      ),

    findByIds: (ids: List<KlkPostId>): Future<List<KlkPostId>> =>
      pipe(
        collection.collection(coll =>
          coll
            .find({ id: { $in: ids.map(KlkPostId.unwrap) } }, { projection: { id: 1 } })
            .map(
              flow(
                KlkPost.onlyWithIdCodec.decode,
                Either.bimap(decodeError, p => p.id),
              ),
            )
            .toArray(),
        ),
        Future.chain(flow(Either.sequenceArray, Task.of)),
      ),

    findById: (id: KlkPostId): Future<Maybe<KlkPost>> =>
      collection.findOne({ id: KlkPostId.unwrap(id) }),

    updateSizeById: (id: KlkPostId, size: Size): Future<boolean> =>
      pipe(
        collection.collection(coll =>
          coll.updateOne({ id: KlkPostId.unwrap(id) }, { $set: { size } }),
        ),
        Future.map(r => r.matchedCount === 1),
      ),

    updatePostById: (id: KlkPostId, payload: KlkPostEditPayload): Future<boolean> =>
      pipe(
        collection.collection(coll =>
          coll.updateOne(
            { id: KlkPostId.unwrap(id) },
            { $set: klkPostEditPayloadEncoder.encode(payload) },
          ),
        ),
        Future.map(r => r.matchedCount === 1),
      ),

    insertMany: (posts: List<KlkPost>) => collection.insertMany(posts),

    upsert: (id: KlkPostId, post: KlkPost): Future<boolean> =>
      pipe(
        collection.updateOne({ id: KlkPostId.unwrap(id) }, post, { upsert: true }),
        Future.map(_ => _.modifiedCount + _.upsertedCount === 1),
      ),
  }

  function cursorFromQueryParams(
    coll: Collection<OutputType>,
    { episode, search, sortNew, active }: KlkPostsQuery,
    page: number,
  ): Cursor<OutputType> {
    const find = coll.find({
      active,
      ...foldRecord(episode, e => ({ episode: EpisodeNumber.toNullable(e) })),
      ...foldRecord(search, s => ({ $text: { $search: s } })),
    })
    const sorted = find.sort([['createdAt', sortNew ? -1 : 1]])

    return sorted.skip(page * config.pageSize).limit(config.pageSize)
  }

  function foldRecord<A>(
    maybe: Maybe<A>,
    f: (a: A) => FilterQuery<OutputType>,
  ): FilterQuery<OutputType> {
    return pipe(
      maybe,
      Maybe.fold(() => ({}), f),
    )
  }
}
