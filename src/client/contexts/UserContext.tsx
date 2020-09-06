import React, { createContext, useCallback, useContext, useState } from 'react'

import { LoginPayload } from '../../shared/models/LoginPayload'
import { Token } from '../../shared/models/Token'
import { TokenPayload } from '../../shared/models/TokenPayload'
import { Future, Maybe, pipe } from '../../shared/utils/fp'
import { apiRoutes } from '../utils/apiRoutes'
import { Http } from '../utils/Http'

type UserContext = Readonly<{
  token: Maybe<Token>
  login: (payload: LoginPayload) => Promise<Maybe<Token>>
  logout: () => void
}>

const UserContext = createContext<UserContext | undefined>(undefined)

const USER_TOKEN = 'userToken'

export const UserContextProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState<Maybe<Token>>(() =>
    pipe(Maybe.fromNullable(localStorage.getItem(USER_TOKEN)), Maybe.map(Token.wrap)),
  )

  const updateToken = useCallback((token: Maybe<Token>) => {
    pipe(
      token,
      Maybe.fold(
        () => localStorage.removeItem(USER_TOKEN),
        t => localStorage.setItem(USER_TOKEN, Token.unwrap(t)),
      ),
    )
    setToken(token)
  }, [])

  const login = useCallback(
    (payload: LoginPayload): Promise<Maybe<Token>> =>
      pipe(
        Http.post(apiRoutes.login, payload, LoginPayload.codec.encode, TokenPayload.codec.decode),
        Future.map(Maybe.some),
        Future.recover<Maybe<TokenPayload>>(_ => Future.right(Maybe.none)),
        Future.map(
          Maybe.map(({ token }) => {
            updateToken(Maybe.some(token))
            return token
          }),
        ),
        Future.runUnsafe,
      ),
    [updateToken],
  )

  const logout = useCallback(() => updateToken(Maybe.none), [updateToken])

  const value: UserContext = {
    token,
    login,
    logout,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): UserContext => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserContextProvider')
  }
  return context
}
