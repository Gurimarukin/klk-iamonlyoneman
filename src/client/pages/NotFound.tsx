import styled from '@emotion/styled'

import { GradientContainer } from '../components/GradientContainer'
import { PrettyLink } from '../components/PrettyLink'
import { routes } from '../router/routes'
import { theme } from '../utils/theme'

export const NotFound = (): JSX.Element => (
  <Container>
    <StyledH3>Page not found</StyledH3>
    <StyledLink to={routes.home()}>home</StyledLink>
  </Container>
)

const Container = styled(GradientContainer)({
  height: '100%',
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

const StyledLink = styled(PrettyLink)({
  fontSize: '1.2em',
  marginTop: '3em',
})
