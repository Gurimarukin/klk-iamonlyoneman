import { flow, pipe } from 'fp-ts/function'
import * as H from 'hyper-ts'

import { LoginPayload } from '../../shared/models/login/LoginPayload'
import { TokenDAO } from '../../shared/models/login/TokenDAO'
import { Maybe } from '../../shared/utils/fp'
import { UserService } from '../services/UserService'
import { EndedMiddleware, MyMiddleware as M } from '../webServer/models/MyMiddleware'

export type UserController = ReturnType<typeof UserController>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UserController(userService: UserService) {
  // const logger = Logger('UserController')

  const login: EndedMiddleware = EndedMiddleware.withBody(
    LoginPayload.codec,
  )(({ user, password }) =>
    pipe(
      userService.login(user, password),
      M.fromTaskEither,
      M.ichain(
        Maybe.fold(
          () => M.sendWithStatus(H.Status.BadRequest)(''),
          flow(TokenDAO, M.json(TokenDAO.codec)),
        ),
      ),
    ),
  )

  return { login }
}
