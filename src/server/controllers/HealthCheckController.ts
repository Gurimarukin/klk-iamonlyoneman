import { pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'

import { HealthCheckService } from '../services/HealthCheckService'
import { EndedMiddleware, MyMiddleware as M } from '../webServer/models/MyMiddleware'

export type HealthCheckController = ReturnType<typeof HealthCheckController>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HealthCheckController(healthCheckService: HealthCheckService) {
  const index: EndedMiddleware = pipe(
    M.fromTaskEither(healthCheckService.check),
    M.ichain(ok =>
      ok ? M.sendWithStatus(H.Status.OK)('') : M.sendWithStatus(H.Status.InternalServerError)(''),
    ),
  )

  return { index }
}
