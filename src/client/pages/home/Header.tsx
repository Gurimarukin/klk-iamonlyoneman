import styled from '@emotion/styled'
import React, { forwardRef } from 'react'

import { KlkPostsQuery } from '../../../shared/models/KlkPostsQuery'
import { Maybe } from '../../../shared/utils/fp'
import { Link } from '../../components/Link'
import { Logout } from '../../components/svgs'
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

    return (
      <StyledHeader ref={ref}>
        <StyledNav>
          <HomeLink to={{ episode: Maybe.none, sortNew: true }}>all</HomeLink>
          <EpisodePicker />
          <SearchInput />
          <SortPicker />
          <StyledLink to={routes.about}>about</StyledLink>
          {isAdmin ? (
            <LogoutButton onClick={logout}>
              <Logout />
            </LogoutButton>
          ) : null}
        </StyledNav>
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
    <StyledLink
      to={routes.home(KlkPostsQuery.toPartial(newQuery))}
      className={isSelected ? SELECTED : undefined}
    >
      {children}
    </StyledLink>
  )
}

const klkPostsQueryWithoutSortNewEquals = (a: KlkPostsQuery, b: KlkPostsQuery): boolean =>
  KlkPostsQuery.eq.equals({ ...a, sortNew: false }, { ...b, sortNew: false })

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
  display: 'grid',
  alignItems: 'center',
  [theme.mediaQueries.desktop]: {
    gridTemplateColumns: 'auto auto 1fr auto auto auto',
    columnGap: theme.spacing.m,
  },
  [theme.mediaQueries.mobile]: {
    gridTemplateColumns: 'auto 1fr auto',
    rowGap: theme.spacing.s,
    justifyItems: 'start',
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
      filter: 'none',
    },
  },

  '&::after': {
    content: "''",
    position: 'absolute',
    width: `calc(100% - 2 * ${theme.Header.link.padding.left})`,
    borderBottom: `2px solid ${theme.colors.lime}`,
    left: theme.Header.link.padding.left,
    bottom: `calc(${theme.Header.link.padding.top} - 1px)`,
    filter: `drop-shadow(1px 1px 0 ${theme.colors.darkgrey})`,
    opacity: 0,
    transition: 'all 0.3s',
  },

  '&:hover::after': {
    opacity: 1,
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
  filter: `drop-shadow(1px 1px 0 ${theme.colors.darkgrey})`,
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
