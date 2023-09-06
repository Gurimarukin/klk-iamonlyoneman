import styled from '@emotion/styled'
import React from 'react'

import { KlkPostsQuery } from '../../../shared/models/KlkPostsQuery'

import { PrettyLink } from '../../components/PrettyLink'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { routes } from '../../router/routes'
import { theme } from '../../utils/theme'

const SELECTED = 'selected'

type HomeLinkProps = {
  to: Partial<KlkPostsQuery>
  compareOnlySort?: boolean
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

export const klkPostsQueryWithoutSortNewEquals = (a: KlkPostsQuery, b: KlkPostsQuery): boolean =>
  KlkPostsQuery.eq.equals({ ...a, sortNew: false }, { ...b, sortNew: false })

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

export const StyledAbout = styled(StyledLink)({
  [theme.mediaQueries.mobile]: {
    gridArea: 'about',
  },
})

const StyledHomeLink = styled(StyledLink)({
  fontWeight: 'bold',
})
