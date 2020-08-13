// import * as H from 'hyper-ts'

import { EndedMiddleware } from '../models/EndedMiddleware'
// import { KlkPostService } from '../services/KlkPostService'
import { PartialLogger } from '../services/Logger'
// import { ControllerUtils } from '../routes/ControllerUtils'

export type KlkPostController = ReturnType<typeof KlkPostController>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostController(
  Logger: PartialLogger,
  // klkPostService: KlkPostService,
) {
  const _logger = Logger('KlkPostController')

  const listAll: EndedMiddleware = EndedMiddleware.OK('HAHA !')

  return { listAll }
}
