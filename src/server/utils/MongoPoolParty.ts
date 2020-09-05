import { Collection, MongoClient } from 'mongodb'

import { Future, IO, List, pipe } from '../../shared/utils/fp'
import { Config } from '../config/Config'
import { MsDuration } from '../models/MsDuration'
import { PartialLogger } from '../services/Logger'
import { FutureUtils } from './FutureUtils'

export type MongoPoolParty = Readonly<{
  mongoCollection: (coll: string) => <A>(f: (coll: Collection) => Promise<A>) => Future<A>
}>

export function MongoPoolParty(
  Logger: PartialLogger,
  config: Config,
  poolSize = 10,
): Future<MongoPoolParty> {
  if (poolSize < 1) throw new Error('poolSize must be greater than 1')

  const logger = Logger('MongoPoolParty')

  const url = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}`

  return pipe(
    List.makeBy(poolSize, _ =>
      pipe(
        Future.apply(() => new MongoClient(url, { useUnifiedTopology: true }).connect()),
        Future.map(client => client.db(config.db.dbName)),
      ),
    ),
    List.sequence(Future.taskEither),
    Future.map(conn => {
      let connections = conn

      const rotateConnections = (): IO<void> =>
        IO.apply(() => {
          connections = List.rotate(1)(connections)
        })

      const mongoCollection = (coll: string) => <A>(
        f: (coll: Collection) => Promise<A>,
      ): Future<A> =>
        pipe(
          Future.apply(() => f(connections[0].collection(coll))),
          Future.chain(res =>
            pipe(
              Future.fromIOEither(rotateConnections()),
              Future.map(_ => res),
            ),
          ),
        )

      return { mongoCollection }
    }),
    FutureUtils.retryIfFailed(MsDuration.minutes(5), {
      onFailure: e => logger.error('Failed to create pool:\n', e),
      onSuccess: _ => IO.unit,
    }),
  )
}