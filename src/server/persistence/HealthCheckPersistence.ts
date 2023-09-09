import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { Either, Future } from '../../shared/utils/fp'

import { WithDb } from '../models/mongo/WithDb'

export type HealthCheckPersistence = ReturnType<typeof HealthCheckPersistence>

const ResultCodec = D.struct({ ok: D.number })

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HealthCheckPersistence(withDb: WithDb) {
  const check: Future<boolean> = pipe(
    withDb.future(db => db.command({ ping: 1 })),
    Future.map((res: unknown) => {
      const decoded = ResultCodec.decode(res)
      return Either.isRight(decoded) && decoded.right.ok === 1
    }),
  )

  return { check }
}
