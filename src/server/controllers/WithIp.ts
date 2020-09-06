import { IncomingHttpHeaders } from 'http'

import { Request } from 'express'
import * as H from 'hyper-ts'

import { List, Maybe, pipe } from '../../shared/utils/fp'
import { Config } from '../config/Config'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { PartialLogger } from '../services/Logger'
import { ControllerUtils } from '../utils/ControllerUtils'

export type WithIp = (
  cause: string,
) => (f: (ip: string, req: Request) => EndedMiddleware) => EndedMiddleware

export const WithIp = (Logger: PartialLogger, config: Config): WithIp => cause => f => {
  const logger = Logger('WithIp')

  return pipe(
    ControllerUtils.withRequest,
    H.ichain(req =>
      pipe(
        pipe(
          extractHeader('x-forwarded-for', req.headers),
          Maybe.alt(() => extractHeader('remote-address', req.headers)),
          Maybe.alt(() => extractHeader('x-real-ip', req.headers)),
          Maybe.alt(() => (config.isDev ? Maybe.some(req.ip) : Maybe.none)),
        ),
        Maybe.fold(
          () =>
            pipe(
              logger.error(`Request rejected because ip is required for ${cause}`),
              H.fromIOEither,
              H.ichain(_ => EndedMiddleware.text(H.Status.BadRequest)()),
            ),
          ip => f(ip, req),
        ),
      ),
    ),
  )
}

function extractHeader(name: string, headers: IncomingHttpHeaders): Maybe<string> {
  return pipe(Maybe.fromNullable(headers[name]), Maybe.chain(headerToString))
}

function headerToString(header: string | string[]): Maybe<string> {
  return Array.isArray(header)
    ? List.isEmpty(header)
      ? Maybe.none
      : Maybe.some(header.join(';'))
    : Maybe.some(header)
}
