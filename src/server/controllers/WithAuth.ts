import * as H from 'hyper-ts'

import { Token } from '../../shared/models/Token'
import { Maybe, pipe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { User } from '../models/user/User'
import { PartialLogger } from '../services/Logger'
import { UserService } from '../services/UserService'

export type WithAuth = (f: (user: User) => EndedMiddleware) => EndedMiddleware

export const WithAuth = (Logger: PartialLogger, userService: UserService): WithAuth => {
  const _logger = Logger('WithAuth')

  return f =>
    pipe(
      H.decodeHeader('Authorization', Token.codec.decode),
      H.ichain(token =>
        pipe(
          H.fromTaskEither(userService.findByToken(token)),
          H.ichain(Maybe.fold(() => EndedMiddleware.text(H.Status.Unauthorized)(), f)),
        ),
      ),
      H.orElse(_ => EndedMiddleware.text(H.Status.Forbidden)()),
    )
}
