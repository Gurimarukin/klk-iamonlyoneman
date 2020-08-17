import * as H from 'hyper-ts'

import { pipe } from '../../shared/utils/fp'

import { KlkPosts } from '../../shared/models/klkPost/KlkPost'

import { EndedMiddleware } from '../models/EndedMiddleware'
import { KlkPostService } from '../services/KlkPostService'
import { PartialLogger } from '../services/Logger'

export type KlkPostController = ReturnType<typeof KlkPostController>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function KlkPostController(Logger: PartialLogger, klkPostService: KlkPostService) {
  const _logger = Logger('KlkPostController')

  const listAll: EndedMiddleware = pipe(
    klkPostService.findAll(),
    H.fromTaskEither,
    H.ichain(_ => EndedMiddleware.json(H.Status.OK)(KlkPosts.codec.encode(_))),
  )

  return { listAll }
}
