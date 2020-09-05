import { Interpolation } from '@emotion/core'
import styled from '@emotion/styled'
import React from 'react'

import { ABlank } from '../components/ABlank'
import { GradientContainer } from '../components/GradientContainer'
import { Link } from '../components/Link'
import { routes } from '../Router'

export const About = (): JSX.Element => (
  <Container>
    <StyledH2>
      All posts by <StyledA href='https://www.reddit.com/u/iamonlyoneman'>/u/iamonlyoneman</StyledA>{' '}
      on <StyledA href='https://www.reddit.com/r/KillLaKill'>/r/KillLaKill</StyledA>.
    </StyledH2>
    <StyledH3>
      <StyledA href='https://www.reddit.com/u/Grimalkin8675'>I</StyledA> am really found of{' '}
      <StyledA href='https://www.reddit.com/r/iamonlyonesubreddit/comments/aye80k/these_are_not_screenshots/'>
        his series
      </StyledA>{' '}
      and wanted a better viewer for it.
    </StyledH3>
    <GithubA href='https://github.com/Gurimarukin/klk-iamonlyoneman'>github</GithubA>
    <StyledLink to={routes.home}>home</StyledLink>
  </Container>
)

const Container = styled(GradientContainer)({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textShadow: '0 0 6px black',
})

const StyledH2 = styled.h2({
  fontSize: '2.8em',
})

const StyledH3 = styled.h3({
  fontSize: '1.8em',
  marginTop: '2em',
})

const StyledA = styled(ABlank)({
  color: 'inherit',
})

const common: Interpolation = {
  fontSize: '1.2em',
  marginTop: '3em',
}

const GithubA = styled(StyledA)({
  ...common,
})

const StyledLink = styled(Link)({
  ...common,
  color: 'inherit',
})
