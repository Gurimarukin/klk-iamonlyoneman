import { pipe } from 'fp-ts/function'

import { Size } from '../../shared/models/klkPost/Size'
import { Future, Maybe } from '../../shared/utils/fp'

import { Probe } from '../models/Probe'
import { Logger } from '../services/Logger'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const probe = (require('probe-image-size') as unknown) as Probe

export namespace ProbeUtils {
  export function probeSize(url: string, logger: Logger): Future<Maybe<Size>> {
    return pipe(
      Future.tryCatch(() => probe(url)),
      Future.map(({ width, height }) => Maybe.some({ width, height })),
      Future.recover(() => Future.right<Maybe<Size>>(Maybe.none)),
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
}
