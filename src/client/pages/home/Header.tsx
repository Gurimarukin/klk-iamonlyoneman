import styled from '@emotion/styled'
import React, { forwardRef, useCallback } from 'react'

import { PartialKlkPostQuery } from '../../../shared/models/PartialKlkPostQuery'
import { Link } from '../../components/Link'
import { Logout } from '../../components/svgs'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { useUser } from '../../contexts/UserContext'
import { routes } from '../../Router'
import { theme } from '../../utils/theme'
import { EpisodePicker } from './EpisodePicker'

const SELECTED = 'selected'

export const Header = forwardRef<HTMLElement>(
  (_, ref): JSX.Element => {
    const { isAdmin, logout } = useUser()

    const query = useKlkPostsQuery()
    const homeLink = useCallback(
      (toQuery: PartialKlkPostQuery, label: string, key?: string | number): JSX.Element => (
        <StyledLink
          key={key}
          to={routes.home(toQuery)}
          className={toQuery.episode === query.episode ? SELECTED : undefined}
        >
          {label}
        </StyledLink>
      ),
      [query.episode],
    )

    return (
      <StyledHeader ref={ref}>
        <StyledNav>
          <NavSection>
            {homeLink({}, 'new')}
            <Separator />
            <EpisodePicker homeLink={homeLink} />
          </NavSection>
          <NavSection>
            <StyledLink to={routes.about}>about</StyledLink>
            {isAdmin ? (
              <>
                <Separator />
                <StyledButton onClick={logout}>
                  <Logout />
                </StyledButton>
              </>
            ) : null}
          </NavSection>
        </StyledNav>
      </StyledHeader>
    )
  },
)

const StyledHeader = styled.header({
  display: 'flex',
  justifyContent: 'center',
  background: theme.Header.gradient,
  color: theme.colors.white,
  boxShadow: theme.boxShadow,
  padding: '0.67em',
  fontWeight: 'bold',
  fontSize: '1.05em',
})

const StyledNav = styled.nav({
  width: '100%',
  maxWidth: 1200,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
})

const NavSection = styled.nav({
  display: 'flex',
  alignItems: 'center',
})

const Separator = styled.span({
  alignSelf: 'stretch',
  margin: `0 ${theme.spacing.extraSmall}px`,
  position: 'relative',

  '&::before': {
    content: `''`,
    position: 'absolute',
    left: -1,
    top: -1,
    height: '100%',
    borderLeft: `1px solid ${theme.colors.ocre}`,
  },

  '&::after': {
    content: `''`,
    position: 'absolute',
    left: 1,
    top: 1,
    height: '100%',
    borderLeft: `1px solid ${theme.colors.white}`,
  },
})

const StyledLink = styled(Link)({
  padding: `${theme.Header.link.padding.top} ${theme.Header.link.padding.left}`,
  color: 'inherit',
  textShadow: theme.textShadow(theme.colors.darkgrey),
  borderRadius: 2,
  position: 'relative',
  transition: 'all 0.3s',

  [`&.${SELECTED}`]: {
    backgroundColor: theme.colors.lime,
    boxShadow: theme.boxShadowLight,

    '&::after': {
      borderColor: theme.colors.white,
    },
  },

  '&::after': {
    content: `''`,
    position: 'absolute',
    width: `calc(100% - 2 * ${theme.Header.link.padding.left})`,
    borderBottom: `2px solid ${theme.colors.lime}`,
    left: theme.Header.link.padding.left,
    bottom: `calc(${theme.Header.link.padding.top} - 1px)`,
    transition: 'all 0.3s',
    opacity: 0,
  },

  '&:hover::after': {
    opacity: 1,
  },
})

const StyledButton = styled.button({
  border: 'none',
  background: 'none',
  color: 'inherit',
  width: '1.1em',
  height: '1.1em',
  fontSize: '1.4em',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 0,
  filter: `drop-shadow(1px 1px 0 ${theme.colors.darkgrey})`,

  '&::after': {
    content: `''`,
    position: 'absolute',
    width: '100%',
    borderBottom: `2px solid ${theme.colors.lime}`,
    left: 0,
    bottom: -1,
    transition: 'all 0.3s',
    opacity: 0,
  },

  '&:hover::after': {
    opacity: 1,
  },
})
