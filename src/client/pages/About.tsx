import styled from '@emotion/styled'
import React from 'react'

import { ABlank } from '../components/ABlank'
import { GradientContainer } from '../components/GradientContainer'
import { Link } from '../components/Link'
import { routes } from '../Router'
import { theme } from '../utils/theme'

export const About = (): JSX.Element => (
  <Container>
    <StyledH2>
      All posts by <StyledA href='https://www.reddit.com/u/iamonlyoneman'>/u/iamonlyoneman</StyledA>{' '}
      on <StyledA href='https://www.reddit.com/r/KillLaKill'>/r/KillLaKill</StyledA>.
    </StyledH2>
    <StyledH3>
      <StyledA href='https://www.reddit.com/u/Grimalkin8675'>I</StyledA> am really found of{' '}
      <StyledA href='https://redd.it/j1hn9b'>his series</StyledA> and wanted a better viewer for it.
    </StyledH3>
    <GithubA href='https://github.com/Gurimarukin/klk-iamonlyoneman'>github</GithubA>
    <HomeLink to={routes.home()}>home</HomeLink>
  </Container>
)

const Container = styled(GradientContainer)({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.xs,
  textShadow: '0 0 6px black',
})

const StyledH2 = styled.h2({
  width: '100%',
  wordBreak: 'break-word',
  fontSize: '2.8em',
})

const StyledH3 = styled.h3({
  fontSize: '1.8em',
  marginTop: '2em',
})

const StyledA = styled(ABlank)({
  color: 'inherit',
  position: 'relative',
  transition: 'all 0.3s',

  '&::after': {
    content: `''`,
    position: 'absolute',
    width: `100%`,
    borderBottom: `2px solid ${theme.colors.lime}`,
    left: 0,
    bottom: '0.4em',
    transition: 'all 0.3s',
    opacity: 0,
  },

  '&:hover::after': {
    opacity: 1,
  },
})

const githubUnderlineMargin = '0.8ch'
const GithubA = styled(StyledA)({
  fontSize: '1.2em',
  marginTop: '3em',

  '&::after': {
    width: `calc(100% - ${githubUnderlineMargin})`,
    left: githubUnderlineMargin,
    bottom: -1,
  },
})

const HomeLink = styled(Link)({
  color: 'inherit',
  fontSize: '1.2em',
  marginTop: '3em',
  position: 'relative',
  transition: 'all 0.3s',

  '&::after': {
    content: `''`,
    position: 'absolute',
    width: `100%`,
    borderBottom: `2px solid ${theme.colors.lime}`,
    left: 0,
    bottom: -2,
    transition: 'all 0.3s',
    opacity: 0,
  },

  '&:hover::after': {
    opacity: 1,
  },
})
