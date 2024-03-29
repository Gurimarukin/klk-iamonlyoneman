import styled from '@emotion/styled'
import { pipe } from 'fp-ts/function'
import { forwardRef, useCallback, useMemo } from 'react'

import { KlkPostsQuery } from '../../../shared/models/KlkPostsQuery'
import { Maybe } from '../../../shared/utils/fp'

import { Logout } from '../../components/svgs'
import { useHistory } from '../../contexts/HistoryContext'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { useUser } from '../../contexts/UserContext'
import { routes } from '../../router/routes'
import { theme } from '../../utils/theme'
import { AvailabilityPicker } from './AvailabilityPicker'
import { EpisodePicker } from './EpisodePicker'
import { HomeLink, StyledAbout } from './HomeLink'
import { SearchInput } from './SearchInput'
import { SortPicker } from './SortPicker'

export const Header = forwardRef<HTMLElement>(({}, ref): JSX.Element => {
  const { isAdmin, logout } = useUser()
  const Nav = useMemo(() => (isAdmin ? AdminNav : StyledNav), [isAdmin])

  return (
    <StyledHeader ref={ref}>
      <Nav>
        <All to={{ episode: Maybe.none, sortNew: true }}>all</All>
        <StyledEpisodePicker />
        <StyledAvailabilityPicker />
        <StyledSearchInput />
        <StyledSortPicker />
        <StyledAbout to={routes.about}>about</StyledAbout>
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
})

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
      <input type="checkbox" checked={query.active} onChange={toggleActive} />
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
    gridTemplateColumns: 'auto auto auto 1fr auto auto',
    columnGap: theme.spacing.m,
  },
  [theme.mediaQueries.mobile]: {
    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateAreas: `
      "all episode episode"
      "available available sort"
      "search search about"
    `,
    rowGap: theme.spacing.s,
    justifyItems: 'start',
  },
})

const AdminNav = styled(StyledNav)({
  [theme.mediaQueries.desktop]: {
    gridTemplateColumns: 'auto auto auto 1fr auto auto auto auto',
  },
  [theme.mediaQueries.mobile]: {
    gridTemplateAreas: `
      "all episode episode"
      "available available sort"
      "search search about"
      "active active logout"
    `,
  },
})

const All = styled(HomeLink)({
  [theme.mediaQueries.mobile]: {
    gridArea: 'all',
  },
})

const StyledEpisodePicker = styled(EpisodePicker)({
  [theme.mediaQueries.mobile]: {
    gridArea: 'episode',
    justifySelf: 'end',
  },
})

const StyledAvailabilityPicker = styled(AvailabilityPicker)({
  [theme.mediaQueries.mobile]: {
    gridArea: 'available',
  },
})

const StyledSearchInput = styled(SearchInput)({
  [theme.mediaQueries.mobile]: {
    gridArea: 'search',
  },
})

const StyledSortPicker = styled(SortPicker)({
  [theme.mediaQueries.mobile]: {
    gridArea: 'sort',
    justifySelf: 'end',
  },
})

const ActiveLabel = styled.label({
  display: 'flex',
  alignItems: 'center',
  padding: `${theme.Header.link.padding.top} ${theme.Header.link.padding.left}`,
  fontWeight: 'normal',
  [theme.mediaQueries.mobile]: {
    gridArea: 'active',
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
    gridArea: 'logout',
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
