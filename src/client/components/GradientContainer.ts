import styled from '@emotion/styled'

import { theme } from '../utils/theme'

export const GradientContainer = styled.div({
  background: `linear-gradient(0deg, ${theme.colors.black} 0%, ${theme.colors.darkblue} 33%, ${theme.colors.darkred} 67%, ${theme.colors.black} 100%)`,
})
