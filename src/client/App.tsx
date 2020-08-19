import styled from '@emotion/styled'
import React, { useMemo } from 'react'
import { ScrollPosition, trackWindowScroll } from 'react-lazy-load-image-component'

import { pipe } from '../shared/utils/fp'

import { KlkPosts } from '../shared/models/klkPost/KlkPost'

import { ABlank } from './components/ABlank'
import { Gallery } from './components/Gallery'
import { useAsyncState } from './hooks/useAsyncState'
import { AsyncState } from './models/AsyncState'
import { Config } from './utils/Config'
import { Http } from './utils/Http'
import { theme } from './utils/theme'

type Props = Readonly<{
  scrollPosition: ScrollPosition
}>

export const App = trackWindowScroll(
  ({ scrollPosition }): JSX.Element => {
    const future = useMemo(() => Http.get(`${Config.apiHost}/klk-posts`, KlkPosts.codec.decode), [])
    const [state] = useAsyncState(future)

    return (
      <Container>
        <Header>
          <StyledH2>
            All posts by{' '}
            <StyledA href='https://www.reddit.com/u/iamonlyoneman'>/u/iamonlyoneman</StyledA> on{' '}
            <StyledA href='https://www.reddit.com/r/KillLaKill'>/r/KillLaKill</StyledA>.
          </StyledH2>
          <StyledH3>
            <StyledA href='https://www.reddit.com/u/Grimalkin8675'>I</StyledA> am really found of{' '}
            <StyledA href='https://www.reddit.com/r/iamonlyonesubreddit/comments/aye80k/these_are_not_screenshots/'>
              his series
            </StyledA>{' '}
            and wanted a better viewer for it.
          </StyledH3>
          {/* <StyledH6>
            (Hover the title to see the date and the link to the original post.)
          </StyledH6> */}
        </Header>
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
  overflow: 'auto scroll',
  fontFamily: 'monospace',
  fontSize: '14px',
  color: 'white',
  background: `linear-gradient(0deg, ${theme.colors.black} 0%, ${theme.colors.darkblue} 33%, ${theme.colors.darkred} 67%, ${theme.colors.black} 100%)`,
})

const Header = styled.header({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '67vh',
  // textShadow: '-1px -1px 4px black, 1px -1px 4px black, -1px 1px 4px black, 1px 1px 4px black',
  textShadow: '0 0 6px black',
})

const StyledH2 = styled.h2({
  fontSize: '2.8em',
})

const StyledH3 = styled.h3({
  fontSize: '1.8em',
  marginTop: '2em',
})

// const StyledH6 = styled.h6({
//   fontSize: '1em',
//   marginTop: '5em',
// })

const StyledA = styled(ABlank)({
  color: 'inherit',
})

const LoadingOrError = styled.div({
  fontSize: '16px',
  textAlign: 'center',
})
