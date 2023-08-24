import { Future } from '../../shared/utils/fp'

import { HealthCheckPersistence } from '../persistence/HealthCheckPersistence'

export type HealthCheckService = ReturnType<typeof HealthCheckService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HealthCheckService(healthCheckPersistence: HealthCheckPersistence) {
  return {
    check: (): Future<boolean> => healthCheckPersistence.check(),
  }
}
