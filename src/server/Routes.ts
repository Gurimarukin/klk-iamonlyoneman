import * as D from 'io-ts/Decoder'

import { KlkPostId } from '../shared/models/klkPost/KlkPostId'
import { pipe } from '../shared/utils/fp'
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
  klkPostController: KlkPostController,
  userController: UserController,
): Route[] => [
  ['get', '/api/klk-posts', klkPostController.klkPosts],
  ['post', '/api/klk-posts/:id', withParams(postId)(klkPostController.klkPostEdit)],
  ['post', '/api/login', rateLimiter(2, MsDuration.minutes(1))(userController.login)],
]
