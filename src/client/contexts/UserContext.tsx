/* eslint-disable functional/no-expression-statements, functional/no-return-void */
import { pipe } from 'fp-ts/function'
import React, { createContext, useCallback, useContext, useState } from 'react'

import { Token } from '../../shared/models/Token'
import { LoginPayload } from '../../shared/models/login/LoginPayload'
import { TokenDAO } from '../../shared/models/login/TokenDAO'
import { Future, Maybe } from '../../shared/utils/fp'

import { Http } from '../utils/Http'
import { apiRoutes } from '../utils/apiRoutes'

type UserContext = {
  token: Maybe<Token>
  isAdmin: boolean
  login: (payload: LoginPayload) => Promise<Maybe<Token>>
  logout: () => void
}

const UserContext = createContext<UserContext | undefined>(undefined)

const USER_TOKEN = 'userToken'

export const UserContextProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState<Maybe<Token>>(() =>
    pipe(Maybe.fromNullable(localStorage.getItem(USER_TOKEN)), Maybe.map(Token.wrap)),
  )

  const isAdmin = Maybe.isSome(token)

  const updateToken = useCallback((token_: Maybe<Token>) => {
    pipe(
      token_,
      Maybe.fold(
        () => localStorage.removeItem(USER_TOKEN),
        t => localStorage.setItem(USER_TOKEN, Token.unwrap(t)),
      ),
    )
    setToken(token_)
  }, [])

  const login = useCallback(
    (payload: LoginPayload): Promise<Maybe<Token>> =>
      pipe(
        Http.post(apiRoutes.login, payload, LoginPayload.codec.encode, TokenDAO.codec.decode),
        Future.map(Maybe.some),
        Future.orElse(() => Future.successful<Maybe<TokenDAO>>(Maybe.none)),
        Future.map(
          Maybe.map(d => {
            updateToken(Maybe.some(d.token))
            return d.token
          }),
        ),
        Future.runUnsafe,
      ),
    [updateToken],
  )

  const logout = useCallback(() => updateToken(Maybe.none), [updateToken])

  const value: UserContext = {
    token,
    isAdmin,
    login,
    logout,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): UserContext => {
  const context = useContext(UserContext)
  if (context === undefined) {
    // eslint-disable-next-line functional/no-throw-statements
    throw Error('useUser must be used within a UserContextProvider')
  }
  return context
}
