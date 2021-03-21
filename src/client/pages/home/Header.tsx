import styled from '@emotion/styled'
import { pipe } from 'fp-ts/function'
import React, { forwardRef, useCallback, useMemo } from 'react'

import { KlkPostsQuery } from '../../../shared/models/KlkPostsQuery'
import { Maybe } from '../../../shared/utils/fp'
import { PrettyLink } from '../../components/PrettyLink'
import { Logout } from '../../components/svgs'
import { useHistory } from '../../contexts/HistoryContext'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { useUser } from '../../contexts/UserContext'
import { routes } from '../../Router'
import { theme } from '../../utils/theme'
import { EpisodePicker } from './EpisodePicker'
import { SearchInput } from './SearchInput'
import { SortPicker } from './SortPicker'

const SELECTED = 'selected'

export const Header = forwardRef<HTMLElement>(
  ({}, ref): JSX.Element => {
    const { isAdmin, logout } = useUser()
    const Nav = useMemo(() => (isAdmin ? AdminNav : StyledNav), [isAdmin])

    return (
      <StyledHeader ref={ref}>
        <Nav>
          <HomeLink to={{ episode: Maybe.none, sortNew: true }}>all</HomeLink>
          <EpisodePicker />
          <SearchInput />
          <SortPicker />
          <StyledLink to={routes.about}>about</StyledLink>
          {isAdmin ? (
            <>
              <ActiveToggler />
              <LogoutButton onClick={logout}>
                <Logout />
              </LogoutButton>
            </>
          ) : null}
        </Nav>
      </StyledHeader>
    )
  },
)

type HomeLinkProps = {
  readonly to: Partial<KlkPostsQuery>
  readonly compareOnlySort?: boolean
}

export const HomeLink: React.FC<HomeLinkProps> = ({ to, compareOnlySort = false, children }) => {
  const query = useKlkPostsQuery()

  const newQuery = { ...query, ...to }

  const isSelected = compareOnlySort
    ? newQuery.sortNew === query.sortNew
    : klkPostsQueryWithoutSortNewEquals(newQuery, query)

  return (
    <StyledHomeLink
      to={routes.home(KlkPostsQuery.toPartial(newQuery))}
      className={isSelected ? SELECTED : undefined}
    >
      {children}
    </StyledHomeLink>
  )
}

const klkPostsQueryWithoutSortNewEquals = (a: KlkPostsQuery, b: KlkPostsQuery): boolean =>
  KlkPostsQuery.eq.equals({ ...a, sortNew: false }, { ...b, sortNew: false })

const ActiveToggler = (): JSX.Element => {
  const { navigate } = useHistory()
  const query = useKlkPostsQuery()

  const toggleActive = useCallback(
    () => pipe({ ...query, active: !query.active }, KlkPostsQuery.toPartial, routes.home, navigate),
    [navigate, query],
  )

  return (
    <ActiveLabel>
      <u>active:</u> {' '}
      <input type='checkbox' checked={query.active} onChange={toggleActive} />
    </ActiveLabel>
  )
}

const StyledHeader = styled.header({
  display: 'flex',
  justifyContent: 'center',
  background: theme.Header.gradient,
  color: theme.colors.white,
  boxShadow: theme.boxShadow,
  padding: '0.67em',
  fontSize: '1.05em',
})

const StyledNav = styled.nav({
  width: '100%',
  maxWidth: 1200,
  display: 'grid',
  alignItems: 'center',
  textShadow: theme.textShadow(theme.colors.darkgrey),
  [theme.mediaQueries.desktop]: {
    gridTemplateColumns: 'auto auto 1fr auto auto',
    columnGap: theme.spacing.m,
  },
  [theme.mediaQueries.mobile]: {
    gridTemplateColumns: 'auto 1fr auto',
    rowGap: theme.spacing.s,
    justifyItems: 'start',
  },
})

const AdminNav = styled(StyledNav)({
  [theme.mediaQueries.desktop]: {
    gridTemplateColumns: 'auto auto 1fr auto auto auto auto',
  },
})

const StyledLink = styled(PrettyLink)({
  [`&.${SELECTED}`]: {
    backgroundColor: theme.colors.lime,
    boxShadow: theme.boxShadowLight,

    '&::before': {
      filter: theme.dropShadow(theme.colors.darkgrey),
    },

    '&::after': {
      borderColor: theme.colors.white,
      filter: 'none',
    },
  },
})

const StyledHomeLink = styled(StyledLink)({
  fontWeight: 'bold',
})

const ActiveLabel = styled.label({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 'normal',
  [theme.mediaQueries.mobile]: {
    justifySelf: 'end',
  },
})

const LogoutButton = styled.button({
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
  filter: theme.dropShadow(theme.colors.darkgrey),
  [theme.mediaQueries.mobile]: {
    gridColumnStart: 3,
    justifySelf: 'end',
  },

  '&::after': {
    content: "''",
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
