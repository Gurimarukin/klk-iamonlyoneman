import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { Db } from 'mongodb'

import { Either, Future } from '../../shared/utils/fp'

export type HealthCheckPersistence = ReturnType<typeof HealthCheckPersistence>

const ResultCodec = D.type({ ok: D.number })

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HealthCheckPersistence(withDb: <A>(f: (db: Db) => Promise<A>) => Future<A>) {
  return {
    check: (): Future<boolean> =>
      pipe(
        withDb(db => db.command({ ping: 1 })),
        Future.map((res: unknown) => {
          const decoded = ResultCodec.decode(res)
          return Either.isRight(decoded) && decoded.right.ok === 1
        }),
      ),
  }
}
