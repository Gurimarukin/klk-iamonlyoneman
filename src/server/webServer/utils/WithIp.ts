import express from 'express'
import { apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'
import * as D from 'io-ts/Decoder'

import { NonEmptyString } from '../../../shared/models/NonEmptyString'
import { Undefined } from '../../../shared/models/Undefined'
import { Maybe } from '../../../shared/utils/fp'

import { Config } from '../../Config'
import { LoggerGetter } from '../../models/logger/LoggerGetter'
import { EndedMiddleware, MyMiddleware as M } from '../models/MyMiddleware'

export type WithIp = (
  cause: string,
) => (f: (ip: string, req: express.Request) => EndedMiddleware) => EndedMiddleware

const maybeStr = D.union(NonEmptyString.decoder, Undefined.decoder)

export const WithIp = (Logger: LoggerGetter, config: Config): WithIp => {
  const logger = Logger('WithIp')

  return cause => f =>
    pipe(
      apply.sequenceS(M.ApplyPar)({
        req: M.withRequest,
        xForwardedFor: M.decodeHeader('x-forwarded-for', maybeStr),
        remoteAddress: M.decodeHeader('remote-address', maybeStr),
        xRealIp: M.decodeHeader('x-real-ip', maybeStr),
      }),
      M.ichain(({ req, xForwardedFor, remoteAddress, xRealIp }) =>
        pipe(
          Maybe.fromNullable(xForwardedFor),
          Maybe.alt(() => Maybe.fromNullable(remoteAddress)),
          Maybe.alt(() => Maybe.fromNullable(xRealIp)),
          Maybe.alt(() => (config.isDev ? Maybe.some('127.0.0.1') : Maybe.none)),
          Maybe.fold(
            () =>
              pipe(
                logger.error(`Request rejected because ip is required for ${cause}`),
                M.fromIOEither,
                M.ichain(() => M.sendWithStatus(H.Status.BadRequest)('')),
              ),
            ip => f(ip, req),
          ),
        ),
      ),
      M.orElse(() => M.sendWithStatus(H.Status.BadRequest)('')),
    )
}
