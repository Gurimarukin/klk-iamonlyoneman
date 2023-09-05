import { HealthCheckPersistence } from '../persistence/HealthCheckPersistence'

export type HealthCheckService = ReturnType<typeof HealthCheckService>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HealthCheckService(healthCheckPersistence: HealthCheckPersistence) {
  const { check } = healthCheckPersistence

  return { check }
}
