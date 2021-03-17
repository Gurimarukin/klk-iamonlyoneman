import { isDeepStrictEqual } from 'util'

import { pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'

import { List, Maybe, Tuple } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { MsDuration } from '../models/MsDuration'
import { PartialLogger } from '../services/Logger'
import { WithIp } from './WithIp'

export type RateLimiter = ReturnType<typeof RateLimiter>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RateLimiter(Logger: PartialLogger, withIp: WithIp, lifeTime: MsDuration) {
  const logger = Logger('RateLimiter')

  // eslint-disable-next-line functional/no-let
  let requests: List<RequestsHistory> = []

  // eslint-disable-next-line functional/no-expression-statement
  setTimeout(() => (requests = []), MsDuration.unwrap(lifeTime))

  return (limit: number, window: MsDuration) => (middleware: EndedMiddleware): EndedMiddleware =>
    withIp('route with rate limiting')((ip, { path }) => {
      const key = Key(path, ip)
      const now = Date.now()
      const windowStart = now - MsDuration.unwrap(window)

      const [newRequests, result]: Tuple<List<RequestsHistory>, EndedMiddleware> = pipe(
        requests,
        List.findIndex(_ => isDeepStrictEqual(_.key, key)),
        Maybe.fold(
          () => [[RequestsHistory(key, [now])], middleware],
          i => {
            const { history } = requests[i] as RequestsHistory
            const cleaned = history.filter(_ => _ > windowStart)

            if (cleaned.length >= limit) {
              const res = pipe(
                logger.warn(`Too many request on route "${path}" with ip "${ip}"`),
                H.fromIOEither,
                H.ichain(() => EndedMiddleware.text(H.Status.Unauthorized)('Too many requests')),
              )
              return [requests, res]
            }

            const newHistory = RequestsHistory(key, List.snoc(cleaned, now))
            return [List.unsafeUpdateAt(i, newHistory, requests), middleware]
          },
        ),
      )

      // eslint-disable-next-line functional/no-expression-statement
      requests = newRequests

      return result
    })
}

type RequestsHistory = {
  readonly key: Key
  readonly history: List<number>
}

function RequestsHistory(key: Key, history: List<number>): RequestsHistory {
  return { key, history }
}

type Key = {
  readonly path: string
  readonly ip: string
}

function Key(path: string, ip: string): Key {
  return { path, ip }
}
