import { pipe } from 'fp-ts/function'
import { Filter } from 'mongodb'

import { config } from '../../shared/config'
import { KlkPostsQuery } from '../../shared/models/KlkPostsQuery'
import { EpisodeNumber } from '../../shared/models/PartialKlkPostsQuery'
import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Size } from '../../shared/models/klkPost/Size'
import { Either, Future, IO, List, Maybe, NonEmptyArray, NotUsed } from '../../shared/utils/fp'
import { futureMaybe } from '../../shared/utils/futureMaybe'
import { decodeError } from '../../shared/utils/ioTsUtils'

import { KlkPost, OnlyWithIdAndUrlKlkPost, klkPostEditPayloadEncoder } from '../models/KlkPost'
import { Store } from '../models/Store'
import { LoggerGetter } from '../models/logger/LoggerGetter'
import { MongoCollectionGetter } from '../models/mongo/MongoCollection'
import { Sink } from '../models/rx/Sink'
import { TObservable } from '../models/rx/TObservable'
import { FpCollection } from './FpCollection'

export type KlkPostPersistence = ReturnType<typeof KlkPostPersistence>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function KlkPostPersistence(Logger: LoggerGetter, mongoCollection: MongoCollectionGetter) {
  const logger = Logger('KlkPostPersistence')
  const collection = FpCollection(logger)([KlkPost.codec, 'KlkPost'])(mongoCollection('klkPost'))

  const ensureIndexes: Future<NotUsed> = collection.ensureIndexes([
    { key: { id: -1 }, unique: true },
    { key: { createdAt: -1 } },
    { key: { episode: -1 } },
    { key: { title: 'text' } },
  ])

  const count: Future<number> = collection.count({})

  const findAll: TObservable<KlkPost> = collection.findAll()({})

  const findWithEmptySize: Future<List<OnlyWithIdAndUrlKlkPost>> = pipe(
    collection.findAll([KlkPost.onlyWithIdAndUrlCodec, 'OnlyWithIdAndUrlKlkPost'])(
      { size: null },
      { projection: { id: 1, url: 1 } },
    ),
    Sink.readonlyArray,
  )

  return {
    ensureIndexes,

    count,

    findAll,

    findAllByQuery: (
      { episode, search, sortNew, active }: KlkPostsQuery,
      page: number,
    ): Future<List<KlkPost>> => {
      const count_ = Store<number>(0)
      return pipe(
        collection.collection.observable(coll =>
          // eslint-disable-next-line functional/immutable-data
          coll
            .find({
              active,
              ...foldRecord(episode, e => ({ episode: EpisodeNumber.toNullable(e) })),
              ...foldRecord(search, s => ({ $or: [{ id: s }, { $text: { $search: s } }] })),
            })
            .sort([['createdAt', sortNew ? -1 : 1]])
            .skip(page * config.pageSize)
            .limit(config.pageSize)
            .stream(),
        ),

        TObservable.chainEitherK(u =>
          pipe(KlkPost.codec.decode(u), Either.mapLeft(decodeError('KlkPost')(u))),
        ),
        TObservable.chainFirstIOK(() => count_.modify(n => n + 1)),
        TObservable.map(Maybe.some),
        TObservable.concat(
          pipe(
            futureMaybe.none,
            Future.chainFirstIOEitherK(() =>
              pipe(
                count_.get,
                IO.fromIO,
                IO.chain(n => logger.trace(`Found all ${n} documents`)),
              ),
            ),
            TObservable.fromTaskEither,
          ),
        ),
        TObservable.compact,
        Sink.readonlyArray,
      )
    },

    findWithEmptySize,

    findByIds: (ids: List<KlkPostId>): Future<List<KlkPostId>> =>
      pipe(
        collection.findAll([KlkPost.onlyWithIdAndUrlCodec, 'OnlyWithIdAndUrlKlkPost'])(
          { id: { $in: ids.map(KlkPostId.unwrap) } },
          { projection: { id: 1 } },
        ),
        TObservable.map(p => p.id),
        Sink.readonlyArray,
      ),

    findById: (id: KlkPostId): Future<Maybe<KlkPost>> =>
      collection.findOne({ id: KlkPostId.unwrap(id) }),

    updateNoLongerAvailableById: (id: KlkPostId, noLongerAvailable: boolean): Future<boolean> =>
      pipe(
        collection.collection.future(coll =>
          coll.updateOne({ id: KlkPostId.unwrap(id) }, { $set: { noLongerAvailable } }),
        ),
        Future.chainFirstIOEitherK(() =>
          logger.trace('Updated', JSON.stringify({ $set: { noLongerAvailable } })),
        ),
        Future.map(r => r.matchedCount === 1),
      ),

    updateSizeById: (id: KlkPostId, size: Size): Future<boolean> =>
      pipe(
        collection.collection.future(coll =>
          coll.updateOne({ id: KlkPostId.unwrap(id) }, { $set: { size } }),
        ),
        Future.chainFirstIOEitherK(() =>
          logger.trace('Updated', JSON.stringify({ $set: { size } })),
        ),
        Future.map(r => r.matchedCount === 1),
      ),

    updatePostById: (id: KlkPostId, payload: KlkPostEditPayload): Future<boolean> => {
      const encoded = klkPostEditPayloadEncoder.encode(payload)
      return pipe(
        collection.collection.future(coll =>
          coll.updateOne({ id: KlkPostId.unwrap(id) }, { $set: encoded }),
        ),
        Future.chainFirstIOEitherK(() =>
          logger.trace('Updated', JSON.stringify({ $set: encoded })),
        ),
        Future.map(r => r.matchedCount === 1),
      )
    },

    insertMany: (posts: NonEmptyArray<KlkPost>) => collection.insertMany(posts),

    upsert: (id: KlkPostId, post: KlkPost): Future<boolean> =>
      pipe(
        collection.updateOne({ id: KlkPostId.unwrap(id) }, post, { upsert: true }),
        Future.map(_ => _.modifiedCount + _.upsertedCount === 1),
      ),
  }
}

function foldRecord<A, B>(maybe: Maybe<A>, f: (a: A) => Filter<B>): Filter<B> {
  return pipe(
    maybe,
    Maybe.fold(() => ({}), f),
  )
}
