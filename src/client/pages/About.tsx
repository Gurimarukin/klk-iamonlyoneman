import styled from '@emotion/styled'
import React from 'react'

import { ABlank } from '../components/ABlank'
import { GradientContainer } from '../components/GradientContainer'
import { PrettyLink, prettyLinkStyle } from '../components/PrettyLink'
import { routes } from '../Router'
import { theme } from '../utils/theme'

export const About = (): JSX.Element => (
  <Container>
    <StyledH2>
      All posts by
      <StyledABlank href='https://www.reddit.com/u/iamonlyoneman'>u/iamonlyoneman</StyledABlank>on
      <StyledABlank href='https://www.reddit.com/r/KillLaKill'>r/KillLaKill</StyledABlank>.
    </StyledH2>
    <StyledH3>
      <StyledABlank href='https://www.reddit.com/u/Grimalkin8675'>I</StyledABlank>am really found of
      <StyledABlank href='https://redd.it/j1hn9b'>his series</StyledABlank>and wanted a better
      viewer for it.
    </StyledH3>
    <GithubA href='https://github.com/Gurimarukin/klk-iamonlyoneman'>github</GithubA>
    <StyledLink to={routes.home()}>home</StyledLink>
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
  textAlign: 'center',
})

const StyledH3 = styled.h3({
  fontSize: '1.8em',
  marginTop: '2em',
})

const StyledABlank = styled(ABlank)({
  ...prettyLinkStyle.base,
  '&::before': prettyLinkStyle.before,
  '&::after': prettyLinkStyle.after,
  '&:hover::after': prettyLinkStyle.afterHover,
})

const GithubA = styled(StyledABlank)({
  fontSize: '1.2em',
  marginTop: '3em',
})

const StyledLink = styled(PrettyLink)({
  fontSize: '1.2em',
  marginTop: '3em',
})
