import styled from '@emotion/styled'
import React, { useCallback, useMemo } from 'react'
import { trackWindowScroll } from 'react-lazy-load-image-component'
import { useSWRInfinite } from 'swr'

import { KlkPostDAO } from '../../../shared/models/klkPost/KlkPostDAO'
import { KlkPostId } from '../../../shared/models/klkPost/KlkPostId'
import { List, Maybe, pipe } from '../../../shared/utils/fp'
import { GradientContainer } from '../../components/GradientContainer'
import { ChevronUp } from '../../components/svgs'
import { KlkPostsContextProvider } from '../../contexts/KlkPostsContext'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { useMaybeRef } from '../../hooks/useMaybeRef'
import { apiRoutes } from '../../utils/apiRoutes'
import { theme } from '../../utils/theme'
import { Gallery } from './Gallery'
import { Header } from './Header'
import { getKlkPosts } from './klkPostsApi'

const LOADING = 'loading...'
const ERROR = 'error'
const NO_RESULT = 'no result.'
const NBSP = ' '

export const Home = trackWindowScroll(
  ({ scrollPosition }): JSX.Element => {
    const query = useKlkPostsQuery()

    // A function to get the SWR key of each page,
    // its return value will be accepted by `fetcher`.
    // If `null` is returned, the request of that page won't start.
    const getKey = useCallback(
      (pageIndex: number, previousPageData: KlkPostDAO[] | null): string | null => {
        if (previousPageData !== null && previousPageData.length === 0) return null // reached the end
        return apiRoutes.klkPosts(query, pageIndex) // SWR key
      },
      [query],
    )

    const { data, error, mutate, size, setSize } = useSWRInfinite(getKey, getKlkPosts, {
      revalidateOnFocus: false,
    })

    const updateById = useCallback(
      (id: KlkPostId, post: KlkPostDAO): void => {
        mutate(
          List.map(
            List.filterMap(p =>
              p.id === id
                ? pipe(Maybe.some(post), Maybe.filter(KlkPostDAO.matchesQuery(query)))
                : Maybe.some(p),
            ),
          ),
          false,
        )
      },
      [mutate, query],
    )

    const { klkPosts, isLoadingInitialData, isLoadingMore, isReachingEnd } = useMemo(() => {
      const klkPosts = data === undefined ? [] : List.flatten(data)
      const isLoadingInitialData = data === undefined && error === undefined
      const isLoadingMore =
        isLoadingInitialData ||
        (size > 0 && data !== undefined && pipe(data, List.lookup(size - 1), Maybe.isNone))
      const isReachingEnd =
        List.isEmpty(klkPosts) || (data !== undefined && List.isEmpty(data[data.length - 1]))
      // const isRefreshing = isValidating && data !== undefined && data.length === size
      return { klkPosts, isLoadingInitialData, isLoadingMore, isReachingEnd }
    }, [data, error, size])

    const onScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const elt = e.target as HTMLDivElement
        if (
          !isLoadingMore &&
          !isReachingEnd &&
          elt.scrollHeight <= elt.scrollTop + elt.clientHeight
        ) {
          setSize(s => s + 1)
        }
      },
      [isLoadingMore, isReachingEnd, setSize],
    )

    const [headerRef, mountHeaderRef] = useMaybeRef<HTMLElement>()
    const scrollToTop = useCallback((): void => {
      pipe(
        headerRef.current,
        Maybe.map(e => e.scrollIntoView({ behavior: 'smooth' })),
      )
    }, [headerRef])

    return (
      <Container onScroll={onScroll}>
        <Header ref={mountHeaderRef} />
        <KlkPostsContextProvider updateById={updateById}>
          {isLoadingInitialData ? (
            <LoadingOrError>{LOADING}</LoadingOrError>
          ) : List.isEmpty(klkPosts) ? (
            <LoadingOrError>{NO_RESULT}</LoadingOrError>
          ) : (
            <Gallery klkPosts={klkPosts} scrollPosition={scrollPosition} headerRef={headerRef}>
              <LoadingOrError>
                {isLoadingMore ? LOADING : error !== undefined ? ERROR : NBSP}
              </LoadingOrError>
            </Gallery>
          )}
          {List.isEmpty(klkPosts) ? null : (
            <ScrollToTop onClick={scrollToTop} title='Scroll to top'>
              <ChevronUp />
            </ScrollToTop>
          )}
        </KlkPostsContextProvider>
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
  width: '100%',
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
