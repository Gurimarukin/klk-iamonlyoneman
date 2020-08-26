import styled from '@emotion/styled'
import React from 'react'

import { GradientContainer } from '../components/GradientContainer'
import { Link } from '../components/Link'
import { routes } from '../Router'

export const NotFound = (): JSX.Element => (
  <Container>
    <StyledH3>Page not found</StyledH3>
    <StyledLink to={routes.home}>home</StyledLink>
  </Container>
)

const Container = styled(GradientContainer)({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})

const StyledH3 = styled.h3({
  fontSize: '1.8em',
})

const StyledLink = styled(Link)({
  color: 'inherit',
  fontSize: '1.2em',
  marginTop: '3em',
})
