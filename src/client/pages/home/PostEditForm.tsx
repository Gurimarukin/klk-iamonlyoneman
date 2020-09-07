import styled from '@emotion/styled'
import * as E from 'io-ts/Encoder'
import { Lens } from 'monocle-ts'
import React, { useCallback, useState } from 'react'

import { KlkPostDAO } from '../../../shared/models/klkPost/KlkPostDAO'
import { KlkPostEditPayload } from '../../../shared/models/klkPost/KlkPostEditPayload'
import { Either, Future, pipe } from '../../../shared/utils/fp'
import { useKlkPosts } from '../../contexts/KlkPostsContext'
import { theme } from '../../utils/theme'
import { postKlkPostEditForm } from './klkPostsApi'

type Props = Readonly<{
  post: KlkPostDAO
  className?: string
}>

type State = E.OutputOf<typeof KlkPostEditPayload.codec>

type Diff<T, U> = T extends U ? never : T
type StateKeyString = Diff<keyof State, 'active'>

const activeLens = Lens.fromProp<State>()('active')

export const PostEditForm = ({ post, className }: Props): JSX.Element => {
  const { updateById } = useKlkPosts()
  const [error, setError] = useState('')

  const [state, setState] = useState<State>(() => KlkPostEditPayload.codec.encode(post))

  const updateStringField = useCallback(
    (key: StateKeyString) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setState(Lens.fromProp<State>()(key).set(e.target.value)),
    [],
  )
  const updateActive = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setState(activeLens.set(e.target.checked)),
    [],
  )

  const validated = KlkPostEditPayload.codec.decode(state)

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      pipe(
        validated,
        Either.map(payload =>
          pipe(
            postKlkPostEditForm(post.id, payload),
            Future.map(newPost => updateById(post.id, newPost)),
            Future.recover<unknown>(_ => Future.right(setError('error'))),
            Future.runUnsafe,
          ),
        ),
      )
    },
    [post.id, updateById, validated],
  )

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
        <input type='checkbox' checked={state.active} onChange={updateActive} />
      </Active>
      <SubmitContainer>
        {error}
        <button role='submit' disabled={Either.isLeft(validated)}>
          Submit
        </button>
      </SubmitContainer>
    </StyledForm>
  )
}

const StyledForm = styled.form({
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  padding: theme.spacing.extraSmall,
})

const StyledLabel = styled.label({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing.extraSmall,

  '& + &': {
    marginTop: theme.spacing.extraSmall,
  },

  '& > span': {
    flexBasis: 0,
    flexGrow: 1,
    marginRight: theme.spacing.extraSmall,
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
    marginTop: theme.spacing.extraSmall,
    flexBasis: 0,
    flexGrow: 1,
  },

  '& > * + *': {
    marginLeft: theme.spacing.extraSmall,
  },
})

const Active = styled.label({
  display: 'flex',
  alignItems: 'center',

  '& > span': {
    marginRight: theme.spacing.extraSmall,
  },
})

const SubmitContainer = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: theme.spacing.extraSmall,

  '& > button': {
    marginLeft: theme.spacing.extraSmall,
  },
})
