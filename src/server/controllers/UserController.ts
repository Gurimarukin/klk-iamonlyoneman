import * as H from 'hyper-ts'

import { LoginPayload } from '../../shared/models/login/LoginPayload'
import { TokenDAO } from '../../shared/models/login/TokenDAO'
import { Maybe, flow, pipe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { PartialLogger } from '../services/Logger'
import { UserService } from '../services/UserService'
import { ControllerUtils } from '../utils/ControllerUtils'

export type UserController = ReturnType<typeof UserController>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function UserController(Logger: PartialLogger, userService: UserService) {
  const _logger = Logger('UserController')

  const login: EndedMiddleware = ControllerUtils.withJsonBody(
    LoginPayload.codec.decode,
  )(({ user, password }) =>
    pipe(
      userService.login(user, password),
      H.fromTaskEither,
      H.ichain(
        Maybe.fold(
          () => EndedMiddleware.text(H.Status.BadRequest)(),
          flow(TokenDAO, EndedMiddleware.json(H.Status.OK, TokenDAO.codec.encode)),
        ),
      ),
    ),
  )

  return { login }
}
