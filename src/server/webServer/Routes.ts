import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { MsDuration } from '../../shared/MsDuration'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { List } from '../../shared/utils/fp'

import { HealthCheckController } from '../controllers/HealthCheckController'
import { KlkPostController } from '../controllers/KlkPostController'
import { UserController } from '../controllers/UserController'
import { EndedMiddleware } from './models/MyMiddleware'
import { Route } from './models/Route'
import type { RateLimiter } from './utils/RateLimiter'

const { withParams } = EndedMiddleware

const postId = pipe(
  D.struct({ id: KlkPostId.codec }),
  D.map(({ id }) => id),
)

export const Routes = (
  rateLimiter: RateLimiter,
  healthCheckController: HealthCheckController,
  klkPostController: KlkPostController,
  userController: UserController,
): List<Route> => [
  ['get', '/api/healthcheck', healthCheckController.index],
  ['get', '/api/klk-posts', klkPostController.klkPosts],
  ['post', '/api/klk-posts/:id', withParams(postId)(klkPostController.klkPostEdit)],
  ['post', '/api/login', rateLimiter(2, MsDuration.minutes(1))(userController.login)],
]
