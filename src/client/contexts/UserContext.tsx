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
}>

const UserContext = createContext<UserContext | undefined>(undefined)

const USER_TOKEN = 'userToken'

export const UserContextProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState<Maybe<Token>>(() =>
    pipe(Maybe.fromNullable(localStorage.getItem(USER_TOKEN)), Maybe.map(Token.wrap)),
  )

  const login = useCallback(
    (payload: LoginPayload): Promise<Maybe<Token>> =>
      pipe(
        Http.post(apiRoutes.login, payload, LoginPayload.codec.encode, TokenPayload.codec.decode),
        Future.map(Maybe.some),
        Future.recover<Maybe<TokenPayload>>(_ => Future.right(Maybe.none)),
        Future.map(
          Maybe.map(({ token }) => {
            localStorage.setItem(USER_TOKEN, Token.unwrap(token))
            setToken(Maybe.some(token))
            return token
          }),
        ),
        Future.runUnsafe,
      ),
    [],
  )

  const value: UserContext = {
    token,
    login,
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
