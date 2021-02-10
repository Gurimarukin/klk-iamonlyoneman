import styled from '@emotion/styled'

import { s } from '../../shared/utils/StringUtils'
import { theme } from '../utils/theme'

export const GradientContainer = styled.div({
  background: s`linear-gradient(0deg, ${theme.colors.black} 0%, ${theme.colors.darkblue} 33%, ${theme.colors.darkred} 67%, ${theme.colors.black} 100%)`,
})
