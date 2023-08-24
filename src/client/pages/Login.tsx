/* eslint-disable functional/no-expression-statement */
import styled from '@emotion/styled'
import { pipe } from 'fp-ts/function'
import { Lens as MLens } from 'monocle-ts'
import React, { useCallback, useState } from 'react'

import { LoginPayload } from '../../shared/models/login/LoginPayload'
import { Either, Maybe } from '../../shared/utils/fp'

import { routes } from '../Router'
import { GradientContainer } from '../components/GradientContainer'
import { useHistory } from '../contexts/HistoryContext'
import { useUser } from '../contexts/UserContext'
import { theme } from '../utils/theme'

type State = {
  readonly user: string
  readonly password: string
}

namespace State {
  export const empty: State = { user: '', password: '' }

  export namespace Lens {
    export const user = MLens.fromProp<State>()('user')
    export const password = MLens.fromProp<State>()('password')
  }
}

export const Login = (): JSX.Element => {
  const { login } = useUser()
  const { navigate } = useHistory()

  const [error, setError] = useState('')

  const [state, setState] = useState(State.empty)
  const updateUser = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(State.Lens.user.set(e.target.value))
    setError('')
  }, [])
  const updatePassword = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(State.Lens.password.set(e.target.value))
    setError('')
  }, [])

  const validated = LoginPayload.codec.decode(state)

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      pipe(
        validated,
        Either.map(payload =>
          login(payload).then(
            Maybe.fold(
              () => setError('error'),
              () => navigate(routes.home()),
            ),
          ),
        ),
      )
    },
    [login, navigate, validated],
  )

  return (
    <Container>
      <form onSubmit={onSubmit}>
        <StyledLabel>
          <span>User:</span>
          <input type="text" value={state.user} onChange={updateUser} />
        </StyledLabel>
        <StyledLabel>
          <span>Password:</span>
          <input type="password" value={state.password} onChange={updatePassword} />
        </StyledLabel>
        <SubmitContainer>
          {error}
          <button role="submit" disabled={Either.isLeft(validated)}>
            Submit
          </button>
        </SubmitContainer>
      </form>
    </Container>
  )
}

const Container = styled(GradientContainer)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textShadow: '0 0 6px black',
})

const StyledLabel = styled.label({
  display: 'flex',
  alignItems: 'center',

  '& + &': {
    marginTop: theme.spacing.xs,
  },

  '& > span': {
    flexGrow: 1,
    marginRight: theme.spacing.s,
  },
})

const SubmitContainer = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: theme.spacing.xs,

  '& > button': {
    marginLeft: theme.spacing.xs,
  },
})
