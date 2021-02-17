import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { KlkPostId } from '../shared/models/klkPost/KlkPostId'
import { List } from '../shared/utils/fp'
import { HealthCheckController } from './controllers/HealthCheckController'
import { KlkPostController } from './controllers/KlkPostController'
import { RateLimiter } from './controllers/RateLimiter'
import { UserController } from './controllers/UserController'
import { MsDuration } from './models/MsDuration'
import { Route } from './models/Route'
import { ControllerUtils } from './utils/ControllerUtils'

const withParams = ControllerUtils.withParams

const postId = pipe(
  D.type({ id: KlkPostId.codec }),
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
