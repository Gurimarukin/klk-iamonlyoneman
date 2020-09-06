import { isDeepStrictEqual } from 'util'

import * as H from 'hyper-ts'

import { List, Maybe, pipe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { MsDuration } from '../models/MsDuration'
import { PartialLogger } from '../services/Logger'
import { WithIp } from './WithIp'

export type RateLimiter = ReturnType<typeof RateLimiter>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function RateLimiter(Logger: PartialLogger, withIp: WithIp, lifeTime: MsDuration) {
  const logger = Logger('RateLimiter')

  let requests: History[] = []

  setTimeout(() => (requests = []), MsDuration.unwrap(lifeTime))

  return (limit: number, window: MsDuration) => (middleware: EndedMiddleware): EndedMiddleware =>
    withIp('route with rate limiting')((ip, { path }) => {
      const key = Key(path, ip)
      const now = Date.now()
      const windowStart = now - MsDuration.unwrap(window)

      const [newRequests, result]: [History[], EndedMiddleware] = pipe(
        requests,
        List.findIndex(_ => isDeepStrictEqual(_.key, key)),
        Maybe.fold(
          () => [[History(key, [now])], middleware],
          i => {
            const { history } = requests[i]
            const cleaned = history.filter(_ => _ > windowStart)

            if (cleaned.length >= limit) {
              const res = pipe(
                logger.warn(`Too many request on route "${path}" with ip "${ip}"`),
                H.fromIOEither,
                H.ichain(_ => EndedMiddleware.text(H.Status.Unauthorized)('Too many requests')),
              )
              return [requests, res]
            }

            const newHistory = History(key, List.snoc(cleaned, now))
            return [List.unsafeUpdateAt(i, newHistory, requests), middleware]
          },
        ),
      )

      requests = newRequests
      return result
    })
}

interface History {
  key: Key
  history: number[]
}

function History(key: Key, history: number[]): History {
  return { key, history }
}

interface Key {
  path: string
  ip: string
}

function Key(path: string, ip: string): Key {
  return { path, ip }
}
