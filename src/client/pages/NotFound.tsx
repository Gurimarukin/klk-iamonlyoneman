import styled from '@emotion/styled'
import React from 'react'

import { Link } from '../components/Link'
import { routes } from '../Router'

export const NotFound = (): JSX.Element => (
  <Container>
    <span>PAGE NOT FOUND.</span>
    <StyledLink to={routes.home}>home</StyledLink>
  </Container>
)

const Container = styled.div({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})

const StyledLink = styled(Link)({
  color: 'inherit',
  marginTop: '0.67em',
})
