import styled from '@emotion/styled'
import React, { useCallback } from 'react'
import { trackWindowScroll } from 'react-lazy-load-image-component'

import { KlkPostDAO } from '../../../shared/models/klkPost/KlkPostDAO'
import { KlkPostId } from '../../../shared/models/klkPost/KlkPostId'
import { List, Maybe, pipe } from '../../../shared/utils/fp'
import { GradientContainer } from '../../components/GradientContainer'
import { ChevronUp } from '../../components/svgs'
import { KlkPostsContextProvider } from '../../contexts/KlkPostsContext'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { useAsyncState } from '../../hooks/useAsyncState'
import { useMaybeRef } from '../../hooks/useMaybeRef'
import { AsyncState } from '../../models/AsyncState'
import { apiRoutes } from '../../utils/apiRoutes'
import { theme } from '../../utils/theme'
import { Gallery } from './Gallery'
import { Header } from './Header'
import { getKlkPosts } from './klkPostsApi'

export const Home = trackWindowScroll(
  ({ scrollPosition }): JSX.Element => {
    const query = useKlkPostsQuery()
    const [state, update] = useAsyncState(apiRoutes.klkPosts(query), getKlkPosts(query))
    const updateById = useCallback(
      (id: KlkPostId, post: KlkPostDAO) => update(List.map(p => (p.id === id ? post : p))),
      [update],
    )

    const [ref, mountRef] = useMaybeRef<HTMLElement>()
    const scrollToTop = useCallback((): void => {
      pipe(
        ref.current,
        Maybe.map(e => e.scrollIntoView({ behavior: 'smooth' })),
      )
    }, [ref])

    return (
      <Container>
        <Header ref={mountRef} />
        {pipe(
          state,
          AsyncState.fold({
            onLoading: () => <LoadingOrError>loading...</LoadingOrError>,
            onFailure: _ => <LoadingOrError>error</LoadingOrError>,
            onSuccess: klkPosts => (
              <KlkPostsContextProvider updateById={updateById}>
                <Gallery klkPosts={klkPosts} scrollPosition={scrollPosition} headerRef={ref} />
                {List.isEmpty(klkPosts) ? null : (
                  <ScrollToTop onClick={scrollToTop} title='Scroll to top'>
                    <ChevronUp />
                  </ScrollToTop>
                )}
              </KlkPostsContextProvider>
            ),
          }),
        )}
      </Container>
    )
  },
)

const Container = styled(GradientContainer)({
  height: '100vh',
  overflowY: 'auto',
  position: 'relative',
})

const LoadingOrError = styled.div({
  paddingTop: theme.spacing.large,
  textAlign: 'center',
})

const ScrollToTop = styled.button({
  position: 'fixed',
  right: theme.spacing.large,
  bottom: theme.spacing.small,
  width: '1.3em',
  height: '1.3em',
  border: 'none',
  backgroundColor: theme.colors.darkgrey,
  color: theme.colors.pink2,
  opacity: 0.9,
  fontSize: '2em',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: theme.boxShadow,
})
