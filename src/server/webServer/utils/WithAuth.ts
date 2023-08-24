import { pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'
import { Token } from '../../../shared/models/Token'
import { Maybe } from '../../../shared/utils/fp'
import { User } from '../../models/user/User'
import { UserService } from '../../services/UserService'
import { EndedMiddleware, MyMiddleware as M } from '../models/MyMiddleware'

export type WithAuth = (f: (user: User) => EndedMiddleware) => EndedMiddleware

export const WithAuth = (userService: UserService): WithAuth =>
  // const logger = Logger('WithAuth')
  f =>
    pipe(
      M.decodeHeader('Authorization', Token.codec),
      M.ichain(token =>
        pipe(
          M.fromTaskEither(userService.findByToken(token)),
          M.ichain(Maybe.fold(() => M.sendWithStatus(H.Status.Unauthorized)(''), f)),
        ),
      ),
      M.orElse(() => M.sendWithStatus(H.Status.Forbidden)('')),
    )
