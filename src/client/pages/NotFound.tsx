import styled from '@emotion/styled'
import React from 'react'

import { s } from '../../shared/utils/StringUtils'
import { GradientContainer } from '../components/GradientContainer'
import { Link } from '../components/Link'
import { routes } from '../Router'
import { theme } from '../utils/theme'

export const NotFound = (): JSX.Element => (
  <Container>
    <StyledH3>Page not found</StyledH3>
    <StyledLink to={routes.home()}>home</StyledLink>
  </Container>
)

const Container = styled(GradientContainer)({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing.xs,
  textShadow: '0 0 6px black',
})

const StyledH3 = styled.h3({
  fontSize: '1.8em',
})

const StyledLink = styled(Link)({
  color: 'inherit',
  fontSize: '1.2em',
  marginTop: '3em',
  position: 'relative',
  transition: 'all 0.3s',

  '&::after': {
    content: "''",
    position: 'absolute',
    width: '100%',
    borderBottom: s`2px solid ${theme.colors.lime}`,
    left: 0,
    bottom: -2,
    transition: 'all 0.3s',
    opacity: 0,
  },

  '&:hover::after': {
    opacity: 1,
  },
})
