import styled from '@emotion/styled'
import { pipe } from 'fp-ts/lib/pipeable'
import React from 'react'
import { trackWindowScroll } from 'react-lazy-load-image-component'

import { useAsyncState } from '../../hooks/useAsyncState'
import { AsyncState } from '../../models/AsyncState'
import { theme } from '../../utils/theme'
import { Gallery } from './Gallery'
import { getKlkPosts } from './klkPostsApi'

export const Home = trackWindowScroll(
  ({ scrollPosition }): JSX.Element => {
    const [state] = useAsyncState(getKlkPosts)
    return (
      <Container>
        {pipe(
          state,
          AsyncState.fold({
            onLoading: () => <LoadingOrError>loading...</LoadingOrError>,
            onFailure: _ => <LoadingOrError>error</LoadingOrError>,
            onSuccess: p => <Gallery klkPosts={p} scrollPosition={scrollPosition} />,
          }),
        )}
      </Container>
    )
  },
)

const Container = styled.div({
  height: '100vh',
  background: `linear-gradient(0deg, ${theme.colors.black} 0%, ${theme.colors.darkblue} 33%, ${theme.colors.darkred} 67%, ${theme.colors.black} 100%)`,
})

const LoadingOrError = styled.div({
  textAlign: 'center',
})
