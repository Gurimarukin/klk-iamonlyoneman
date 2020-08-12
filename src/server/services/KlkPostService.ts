import { PartialLogger } from './Logger'
import { KlkPostPersistence } from '../persistence/KlkPostPersistence'

export type KlkPostService = ReturnType<typeof KlkPostService>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostService(Logger: PartialLogger, _klkPostPersistence: KlkPostPersistence) {
  const _logger = Logger('KlkPostService')

  return {}
}
