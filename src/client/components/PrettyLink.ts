import styled, { Interpolation, WithTheme } from '@emotion/styled'

import { theme } from '../utils/theme'
import { Link } from './Link'

const base: Interpolation<WithTheme<unknown, unknown>> = {
  display: 'inline-block',
  padding: `${theme.Header.link.padding.top} ${theme.Header.link.padding.left}`,
  color: 'inherit',
  lineHeight: '1em',
  textDecoration: 'none',
  borderRadius: 2,
  position: 'relative',
  transition: 'all 0.3s',
}

const before: Interpolation<WithTheme<unknown, unknown>> = {
  content: "''",
  position: 'absolute',
  width: `calc(100% - 2 * ${theme.Header.link.padding.left})`,
  borderBottom: `1px solid ${theme.colors.white}`,
  left: theme.Header.link.padding.left,
  top: theme.Header.link.underline.top,
  transition: 'all 0.3s',
}

const after: Interpolation<WithTheme<unknown, unknown>> = {
  content: "''",
  position: 'absolute',
  width: `calc(100% - 2 * ${theme.Header.link.padding.left})`,
  borderBottom: `2px solid ${theme.colors.lime}`,
  left: theme.Header.link.padding.left,
  top: `calc(${theme.Header.link.underline.top} + 2px)`,
  filter: theme.dropShadow(theme.colors.darkgrey),
  opacity: 0,
  transition: 'all 0.3s',
}

const afterHover: Interpolation<WithTheme<unknown, unknown>> = {
  opacity: 1,
}

export const prettyLinkStyle = { base, before, after, afterHover }

export const PrettyLink = styled(Link)({
  ...base,
  '&::before': before,
  '&::after': after,
  '&:hover::after': afterHover,
})
