import { pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'

import { Token } from '../../shared/models/Token'
import { Maybe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { User } from '../models/user/User'
import { UserService } from '../services/UserService'

export type WithAuth = (f: (user: User) => EndedMiddleware) => EndedMiddleware

export const WithAuth = (userService: UserService): WithAuth =>
  // const logger = Logger('WithAuth')
  f =>
    pipe(
      H.decodeHeader('Authorization', Token.codec.decode),
      H.ichain(token =>
        pipe(
          H.fromTaskEither(userService.findByToken(token)),
          H.ichain(Maybe.fold(() => EndedMiddleware.text(H.Status.Unauthorized)(), f)),
        ),
      ),
      H.orElse(() => EndedMiddleware.text(H.Status.Forbidden)()),
    )
