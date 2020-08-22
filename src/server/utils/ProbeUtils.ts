import { Future, Maybe, pipe } from '../../shared/utils/fp'

import { Size } from '../../shared/models/klkPost/Size'

import { Probe } from '../models/Probe'
import { Logger } from '../services/Logger'

const probe = (require('probe-image-size') as unknown) as Probe

export namespace ProbeUtils {
  export function probeSize(url: string, logger: Logger): Future<Maybe<Size>> {
    return pipe(
      Future.apply(() => probe(url)),
      Future.map(({ width, height }) => Maybe.some({ width, height })),
      Future.recover(_ => Future.right<Maybe<Size>>(Maybe.none)),
      Future.chain(res =>
        pipe(
          res,
          Maybe.fold(
            () => logger.warn('(probeSize) GET', url, 'KO'),
            _ => logger.debug('(probeSize) GET', url, 'OK'),
          ),
          Future.fromIOEither,
          Future.map(_ => res),
        ),
      ),
    )
  }
}
