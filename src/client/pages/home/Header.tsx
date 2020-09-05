import styled from '@emotion/styled'
import React, { useCallback } from 'react'

import { EpisodeNumber, PartialKlkPostQuery } from '../../../shared/models/PartialKlkPostQuery'
import { List } from '../../../shared/utils/fp'
import { StringUtils } from '../../../shared/utils/StringUtils'
import { Link } from '../../components/Link'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { routes } from '../../Router'
import { theme } from '../../utils/theme'

const SELECTED = 'selected'

export const Header = (): JSX.Element => {
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
    <StyledHeader>
      <StyledNav>
        {homeLink({}, 'new')}
        <EpisodesContainer>
          <EpisodesTitle>Episodes:</EpisodesTitle>
          <Episodes>
            {List.range(1, 25).map(n => homeLink({ episode: n }, StringUtils.pad10(n), n))}
            {homeLink({ episode: EpisodeNumber.unknown }, 'unknown')}
          </Episodes>
        </EpisodesContainer>
        <StyledLink to={routes.about}>about</StyledLink>
      </StyledNav>
    </StyledHeader>
  )
}

const StyledHeader = styled.header({
  background: `linear-gradient(135deg, ${theme.colors.darklila} 0%, ${theme.colors.lila} 100%)`,
  color: theme.colors.white,
  marginBottom: theme.spacing.large,
  boxShadow: theme.boxShadow,
  padding: '0.67em',
  fontWeight: 'bold',
  fontSize: '1.05em',
})

const StyledNav = styled.nav({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
})

const EpisodesContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  margin: `0 ${theme.spacing.small}px`,
  borderLeft: `1px solid ${theme.colors.white}`,
  borderRight: `1px solid ${theme.colors.white}`,
  padding: `0 ${theme.spacing.small}px`,
  position: 'relative',

  '&::before': {
    content: `''`,
    position: 'absolute',
    left: -3,
    top: -2,
    height: '100%',
    borderLeft: `1px solid ${theme.colors.ocre}`,
  },

  '&::after': {
    content: `''`,
    position: 'absolute',
    right: 1,
    top: -2,
    height: '100%',
    borderRight: `1px solid ${theme.colors.ocre}`,
  },
})

const EpisodesTitle = styled.span({
  marginRight: theme.spacing.extraSmall,
})

const Episodes = styled.span({
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',

  '& > a': {
    marginLeft: theme.spacing.extraSmall,
  },
})

const linkPadding = { top: '0.4em', left: '0.3em' }
const StyledLink = styled(Link)({
  padding: `${linkPadding.top} ${linkPadding.left}`,
  color: 'inherit',
  textShadow: theme.textShadow(theme.colors.darkgrey),
  borderRadius: '2px',
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
    width: `calc(100% - 2 * ${linkPadding.left})`,
    borderBottom: `2px solid ${theme.colors.lime}`,
    left: linkPadding.left,
    bottom: `calc(${linkPadding.top} - 1px)`,
    transition: 'all 0.3s',
    opacity: 0,
  },

  '&:hover::after': {
    opacity: 1,
  },
})
