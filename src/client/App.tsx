import styled from '@emotion/styled'
import React, { useMemo } from 'react'

import { pipe } from '../shared/utils/fp'

import { KlkPosts } from '../shared/models/klkPost/KlkPost'

import { useAsyncState } from './hooks/useAsyncState'
import { AsyncState } from './models/AsyncState'
import { Config } from './utils/Config'
import { Http } from './utils/Http'

export const App = (): JSX.Element => {
  const future = useMemo(() => Http.get(`${Config.apiHost}/klk-posts`, KlkPosts.codec.decode), [])
  const [state] = useAsyncState(future)

  return pipe(
    state,
    AsyncState.fold({
      onLoading: () => <div>Loading...</div>,
      onFailure: e => <StyledPre>{e.message}</StyledPre>,
      onSuccess: s => <StyledPre>{JSON.stringify(s, null, 2)}</StyledPre>,
    }),
  )
}

// const StyledContainer = styled.div({
//   color: 'white',
// })

const StyledPre = styled.pre({
  fontFamily: 'monospace',
  fontSize: '16px',
  color: 'white',
})
