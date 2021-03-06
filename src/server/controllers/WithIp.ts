import express from 'express'
import { apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'
import * as D from 'io-ts/Decoder'

import { NonEmptyString } from '../../shared/models/NonEmptyString'
import { Undefined } from '../../shared/models/Undefined'
import { Maybe } from '../../shared/utils/fp'
import { Config } from '../config/Config'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { PartialLogger } from '../services/Logger'
import { ControllerUtils } from '../utils/ControllerUtils'

export type WithIp = (
  cause: string,
) => (f: (ip: string, req: express.Request) => EndedMiddleware) => EndedMiddleware

const maybeStr = D.union(NonEmptyString.decoder, Undefined.decoder).decode

export const WithIp = (Logger: PartialLogger, config: Config): WithIp => {
  const logger = Logger('WithIp')

  return cause => f =>
    pipe(
      apply.sequenceS(H.middleware)({
        req: ControllerUtils.withRequest,
        xForwardedFor: H.decodeHeader('x-forwarded-for', maybeStr),
        remoteAddress: H.decodeHeader('remote-address', maybeStr),
        xRealIp: H.decodeHeader('x-real-ip', maybeStr),
      }),
      H.ichain(({ req, xForwardedFor, remoteAddress, xRealIp }) =>
        pipe(
          Maybe.fromNullable(xForwardedFor),
          Maybe.alt(() => Maybe.fromNullable(remoteAddress)),
          Maybe.alt(() => Maybe.fromNullable(xRealIp)),
          Maybe.alt(() => (config.isDev ? Maybe.some('127.0.0.1') : Maybe.none)),
          Maybe.fold(
            () =>
              pipe(
                logger.error(`Request rejected because ip is required for ${cause}`),
                H.fromIOEither,
                H.ichain(() => EndedMiddleware.text(H.Status.BadRequest)()),
              ),
            ip => f(ip, req),
          ),
        ),
      ),
      H.orElse(() => EndedMiddleware.text(H.Status.BadRequest)()),
    )
}
