import { pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'

import { EndedMiddleware } from '../models/EndedMiddleware'
import { HealthCheckService } from '../services/HealthCheckService'

export type HealthCheckController = ReturnType<typeof HealthCheckController>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HealthCheckController(healthCheckService: HealthCheckService) {
  const index: EndedMiddleware = pipe(
    H.fromTaskEither(healthCheckService.check()),
    H.ichain(ok =>
      ok
        ? EndedMiddleware.text(H.Status.OK)()
        : EndedMiddleware.text(H.Status.InternalServerError)(),
    ),
  )

  return { index }
}
