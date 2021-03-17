import styled from '@emotion/styled'
import React from 'react'

import { useHistory } from './contexts/HistoryContext'
import baloopaaji2BoldTTF from './fonts/baloopaaji2-bold.ttf'
import baloopaaji2TTF from './fonts/baloopaaji2.ttf'
import { Router } from './Router'

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
