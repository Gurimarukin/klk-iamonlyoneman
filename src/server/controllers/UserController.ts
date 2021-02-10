import { flow, pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'

import { LoginPayload } from '../../shared/models/login/LoginPayload'
import { TokenDAO } from '../../shared/models/login/TokenDAO'
import { Maybe } from '../../shared/utils/fp'
import { EndedMiddleware } from '../models/EndedMiddleware'
import { UserService } from '../services/UserService'
import { ControllerUtils } from '../utils/ControllerUtils'

export type UserController = ReturnType<typeof UserController>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UserController(userService: UserService) {
  // const logger = Logger('UserController')

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
