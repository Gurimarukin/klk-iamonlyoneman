import styled from '@emotion/styled'
import { pipe } from 'fp-ts/lib/pipeable'
import React from 'react'
import { trackWindowScroll } from 'react-lazy-load-image-component'

import { GradientContainer } from '../../components/GradientContainer'
import { useAsyncState } from '../../hooks/useAsyncState'
import { AsyncState } from '../../models/AsyncState'
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

const Container = styled(GradientContainer)({
  height: '100vh',
})

const LoadingOrError = styled.div({
  textAlign: 'center',
})
