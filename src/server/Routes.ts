import { KlkPostController } from './controllers/KlkPostController'
import { RateLimiter } from './controllers/RateLimiter'
import { UserController } from './controllers/UserController'
import { MsDuration } from './models/MsDuration'
import { Route } from './models/Route'

export const Routes = (
  rateLimiter: RateLimiter,
  klkPostController: KlkPostController,
  userController: UserController,
): Route[] => [
  ['get', '/api/klk-posts', klkPostController.klkPosts],
  ['post', '/api/login', rateLimiter(2, MsDuration.minutes(1))(userController.login)],
]
