import styled from '@emotion/styled'
import React, { useMemo } from 'react'
import { trackWindowScroll } from 'react-lazy-load-image-component'

import { KlkPosts } from '../shared/models/klkPost/KlkPost'
import { pipe } from '../shared/utils/fp'
import { ABlank } from './components/ABlank'
import { useHistory } from './contexts/HistoryContext'
import baloopaaji2BoldTTF from './fonts/baloopaaji2-bold.ttf'
import baloopaaji2TTF from './fonts/baloopaaji2.ttf'
import { useAsyncState } from './hooks/useAsyncState'
import { AsyncState } from './models/AsyncState'
import { Gallery } from './pages/home/Gallery'
import { Router } from './Router'
import { Config } from './utils/Config'
import { Http } from './utils/Http'

export const App = (): JSX.Element => {
  const { location } = useHistory()

  return (
    <Container>
      <Router path={location.pathname} />
    </Container>
  )
}

export const PouaApp = trackWindowScroll(
  ({ scrollPosition }): JSX.Element => {
    const future = useMemo(
      () => Http.get(`${Config.apiHost}/api/klk-posts`, KlkPosts.codec.decode),
      [],
    )
    const [state] = useAsyncState(`${Config.apiHost}/api/klk-posts`, future)

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

export const fontFamily = {
  baloopaaji2: 'baloopaaji2',
}

const Container = styled.div(
  {
    '@font-face': {
      fontFamily: fontFamily.baloopaaji2,
      src: `url('${baloopaaji2TTF}')`,
      fontWeight: 'normal',
    },
  },
  {
    '@font-face': {
      fontFamily: fontFamily.baloopaaji2,
      src: `url('${baloopaaji2BoldTTF}')`,
      fontWeight: 'bold',
    },
  },
  {
    overflow: 'auto auto',
    fontFamily: fontFamily.baloopaaji2,
    fontSize: '16px',
    letterSpacing: '0.04em',
    color: 'white',
  },
)

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
