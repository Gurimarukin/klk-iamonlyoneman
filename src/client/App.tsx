import styled from '@emotion/styled'

import { useHistory } from './contexts/HistoryContext'
import { Router } from './router/Router'

export const App = (): JSX.Element => {
  const { location } = useHistory()

  return (
    <Container>
      <Router path={location.pathname} />
    </Container>
  )
}

export const fontFamily = {
  baloopaaji2: 'baloopaaji2',
}

const Container = styled.div({
  height: '100vh',
  width: '100vw',
  position: 'absolute',
  top: 0,
  overflow: 'auto auto',
  fontFamily: fontFamily.baloopaaji2,
  fontSize: '16px',
  letterSpacing: '0.04em',
  color: 'white',
})
