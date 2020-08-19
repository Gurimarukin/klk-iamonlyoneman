import styled from '@emotion/styled'
import React, { useMemo } from 'react'

import { pipe } from '../shared/utils/fp'

import { KlkPosts } from '../shared/models/klkPost/KlkPost'

import { Gallery } from './components/Gallery'
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
      onLoading: () => <StyledPre>Loading...</StyledPre>,
      onFailure: _ => <StyledPre>Error</StyledPre>,
      onSuccess: p => <Gallery klkPosts={p} />,
    }),
  )
}

const StyledPre = styled.pre({
  fontFamily: 'monospace',
  fontSize: '16px',
  color: 'white',
})
