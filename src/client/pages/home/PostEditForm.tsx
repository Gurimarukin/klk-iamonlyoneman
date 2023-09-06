/* eslint-disable functional/no-expression-statements */
import styled from '@emotion/styled'
import { pipe } from 'fp-ts/function'
import * as E from 'io-ts/Encoder'
import { Lens } from 'monocle-ts'
import React, { useCallback, useEffect, useState } from 'react'

import { Token } from '../../../shared/models/Token'
import { KlkPostDAO } from '../../../shared/models/klkPost/KlkPostDAO'
import { KlkPostEditPayload } from '../../../shared/models/klkPost/KlkPostEditPayload'
import { Either, Future } from '../../../shared/utils/fp'

import { useKlkPosts } from '../../contexts/KlkPostsContext'
import { theme } from '../../utils/theme'
import { postKlkPostEditForm } from './klkPostsApi'

type Props = {
  token: Token
  post: KlkPostDAO
  className?: string
}

type State = E.OutputOf<typeof KlkPostEditPayload.codec>

type Diff<T, U> = T extends U ? never : T
type StateKeyString = Diff<keyof State, 'active'>

const activeLens = Lens.fromProp<State>()('active')

namespace Status {
  export const empty = ''
  export const loading = 'loading'
  export const error = 'error'
  export const done = 'done'
}

type Status = typeof Status.empty | typeof Status.loading | typeof Status.error | typeof Status.done

export const PostEditForm = ({ post, token, className }: Props): JSX.Element => {
  const { updateById } = useKlkPosts()
  const [status, setStatus] = useState<Status>(Status.empty)

  const [state, setState] = useState<State>(() => KlkPostEditPayload.codec.encode(post))

  const updateStringField = useCallback(
    (key: StateKeyString) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setState(Lens.fromProp<State>()(key).set(e.target.value))
      setStatus(Status.empty)
    },
    [],
  )
  const updateActive = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(activeLens.set(e.target.checked))
    setStatus(Status.empty)
  }, [])

  const validated = KlkPostEditPayload.codec.decode(state)

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      pipe(
        validated,
        Either.map(payload => {
          setStatus(Status.loading)
          pipe(
            postKlkPostEditForm(post.id, payload, token),
            Future.map(newPost => {
              updateById(post.id, newPost)
              setStatus(Status.done)
            }),
            Future.orElse(() => Future.successful<unknown>(setStatus(Status.error))),
            Future.runUnsafe,
          )
        }),
      )
    },
    [post.id, token, updateById, validated],
  )

  useEffect(() => {
    if (status === Status.done) {
      const timer = setTimeout(() => setStatus(Status.empty), 1000)
      return () => clearTimeout(timer)
    }
    return () => {}
  }, [status])

  const input = useCallback(
    (key: StateKeyString, label: string, type = 'text'): JSX.Element => (
      <StyledLabel>
        <span>{label}</span>
        <input type={type} value={state[key]} onChange={updateStringField(key)} />
      </StyledLabel>
    ),

    [state, updateStringField],
  )

  return (
    <StyledForm onSubmit={onSubmit} className={className}>
      {input('title', 'Title:')}
      {input('url', 'Url:')}
      {input('episode', 'Episode:', 'number')}
      <Size>
        {input('width', 'Width:', 'number')}
        {input('height', 'Height:', 'number')}
      </Size>
      <Active>
        <span>Active:</span>
        <input type="checkbox" checked={state.active} onChange={updateActive} />
      </Active>
      <SubmitContainer>
        {status}
        <button
          role="submit"
          disabled={Either.isLeft(validated) || status === Status.loading || status === Status.done}
        >
          Submit
        </button>
      </SubmitContainer>
    </StyledForm>
  )
}

const StyledForm = styled.form({
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  padding: theme.spacing.xs,
})

const StyledLabel = styled.label({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing.xs,

  '& + &': {
    marginTop: theme.spacing.xs,
  },

  '& > span': {
    flexBasis: 0,
    flexGrow: 1,
    marginRight: theme.spacing.xs,
  },

  '& > input': {
    flexBasis: 0,
    flexGrow: 5,
  },
})

const Size = styled.div({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',

  '& > *': {
    marginTop: theme.spacing.xs,
    flexBasis: 0,
    flexGrow: 1,
  },

  '& > * + *': {
    marginLeft: theme.spacing.xs,
  },
})

const Active = styled.label({
  display: 'flex',
  alignItems: 'center',

  '& > span': {
    marginRight: theme.spacing.xs,
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
