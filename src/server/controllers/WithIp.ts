import { Request } from 'express'
import * as H from 'hyper-ts'
import * as D from 'io-ts/Decoder'

import { NonEmptyString } from '../../shared/models/NonEmptyString'
import { Undefined } from '../../shared/models/Undefined'
import { Do, Maybe, pipe } from '../../shared/utils/fp'
import { Config } from '../config/Config'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { PartialLogger } from '../services/Logger'
import { ControllerUtils } from '../utils/ControllerUtils'

export type WithIp = (
  cause: string,
) => (f: (ip: string, req: Request) => EndedMiddleware) => EndedMiddleware

const maybeStr = D.union(NonEmptyString.decoder, Undefined.decoder).decode

export const WithIp = (Logger: PartialLogger, config: Config): WithIp => {
  const logger = Logger('WithIp')

  return cause => f =>
    pipe(
      Do(H.middleware)
        .bind('req', ControllerUtils.withRequest)
        .bind('xForwardedFor', H.decodeHeader('x-forwarded-for', maybeStr))
        .bind('remoteAddress', H.decodeHeader('remote-address', maybeStr))
        .bind('xRealIp', H.decodeHeader('x-real-ip', maybeStr))
        .done(),
      H.ichain(({ req, xForwardedFor, remoteAddress, xRealIp }) =>
        pipe(
          Maybe.fromNullable(
            xForwardedFor || remoteAddress || xRealIp || config.isDev ? '127.0.0.1' : undefined,
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
      H.orElse(_ => EndedMiddleware.text(H.Status.BadRequest)()),
    )
}
