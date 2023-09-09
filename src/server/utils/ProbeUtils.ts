import { pipe } from 'fp-ts/function'

import { Size } from '../../shared/models/klkPost/Size'
import { Future, Maybe } from '../../shared/utils/fp'

import { Probe } from '../models/Probe'
import { LoggerType } from '../models/logger/LoggerType'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const probe = require('probe-image-size') as unknown as Probe

function probeSize(url: string, logger: LoggerType): Future<Maybe<Size>> {
  return pipe(
    Future.tryCatch(() => probe(url)),
    Future.map(({ width, height }) => Maybe.some({ width, height })),
    Future.orElse(() => Future.successful<Maybe<Size>>(Maybe.none)),
    Future.chain(res =>
      pipe(
        res,
        Maybe.fold(
          () => logger.warn('(probeSize) GET', url, 'KO'),
          () => logger.debug('(probeSize) GET', url, 'OK'),
        ),
        Future.fromIOEither,
        Future.map(() => res),
      ),
    ),
  )
}
export const ProbeUtils = { probeSize }
