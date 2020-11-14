import styled from '@emotion/styled'
import React, { useCallback, useEffect, useState } from 'react'

import { EpisodeNumber, PartialKlkPostQuery } from '../../../shared/models/PartialKlkPostQuery'
import { List } from '../../../shared/utils/fp'
import { StringUtils } from '../../../shared/utils/StringUtils'
import { ClickOutside } from '../../components/ClickOutside'
import { ChevronUp } from '../../components/svgs'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { theme } from '../../utils/theme'

interface Props {
  homeLink: HomeLink
}

export type HomeLink = (
  toQuery: PartialKlkPostQuery,
  label: string,
  key?: string | number | undefined,
) => JSX.Element

const IS_OPEN = 'is-open'
const SELECTED = 'selected'
const EPISODE_TITLE = 'episode-title'
const EPISODE_NUMBER = 'episode-number'

const unknownLabel = 'unknown'

export const EpisodePicker = ({ homeLink }: Props): JSX.Element => {
  const query = useKlkPostsQuery()

  const [isOpen, setIsOpen] = useState(false)
  const toggleOpen = useCallback(() => setIsOpen(o => !o), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keyup', onKeyUp)
    return () => window.removeEventListener('keyup', onKeyUp)
  }, [close])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(close, [query])

  return (
    <ClickOutside onClickOutside={close}>
      <Container
        onClick={toggleOpen}
        className={query.episode !== undefined ? SELECTED : undefined}
      >
        <span className={EPISODE_TITLE}>episode:</span>
        <span className={EPISODE_NUMBER}>
          {query.episode === undefined
            ? '–'
            : query.episode === 'unknown'
            ? unknownLabel
            : StringUtils.pad10(query.episode)}
        </span>
        <ChevronDown />
        <Episodes className={isOpen ? IS_OPEN : undefined}>
          <EpisodesHalf>
            {List.range(1, 12).map(n => homeLink({ episode: n }, StringUtils.pad10(n), n))}
          </EpisodesHalf>
          <EpisodesHalf>
            {List.range(13, 25).map(n => homeLink({ episode: n }, StringUtils.pad10(n), n))}
          </EpisodesHalf>
          <EpisodeUnknown>
            {homeLink({ episode: EpisodeNumber.unknown }, unknownLabel)}
          </EpisodeUnknown>
        </Episodes>
      </Container>
    </ClickOutside>
  )
}

const Container = styled.button({
  display: 'flex',
  alignItems: 'center',
  border: 'none',
  borderRadius: 2,
  padding: `0 ${theme.Header.link.padding.left}`,
  color: 'inherit',
  backgroundColor: 'transparent',
  lineHeight: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  position: 'relative',

  [`& .${EPISODE_TITLE}`]: {
    marginRight: theme.spacing.extraSmall,
    textDecoration: 'underline',
    position: 'relative',
  },

  [`& .${EPISODE_TITLE}::after`]: {
    content: `''`,
    position: 'absolute',
    width: '100%',
    borderBottom: `2px solid ${theme.colors.lime}`,
    left: 0,
    bottom: -1,
    transition: 'all 0.3s',
    opacity: 0,
  },

  [`&:hover .${EPISODE_TITLE}::after`]: {
    opacity: 1,
  },

  [`& .${EPISODE_NUMBER}`]: {
    borderRadius: 2,
    padding: `${theme.Header.link.padding.top} ${theme.Header.link.padding.left}`,
    position: 'relative',
    transition: 'all 0.3s',
  },

  [`&.${SELECTED} .${EPISODE_NUMBER}`]: {
    textDecoration: 'underline',
    textShadow: theme.textShadow(theme.colors.darkgrey),
    backgroundColor: theme.colors.lime,
    boxShadow: theme.boxShadowLight,
  },

  [`& .${EPISODE_NUMBER}::after`]: {
    content: `''`,
    position: 'absolute',
    width: `calc(100% - 2 * ${theme.Header.link.padding.left})`,
    left: theme.Header.link.padding.left,
    bottom: `calc(${theme.Header.link.padding.top} - 1px)`,
    transition: 'all 0.3s',
    opacity: 0,
  },

  [`&.${SELECTED} .${EPISODE_NUMBER}::after`]: {
    borderBottom: `2px solid ${theme.colors.white}`,
  },

  [`&:hover .${EPISODE_NUMBER}::after`]: {
    opacity: 1,
  },
})

const ChevronDown = styled(ChevronUp)({
  height: '1em',
  marginLeft: theme.spacing.extraSmall,
  transform: 'rotate(-180deg)',
})

const Episodes = styled.div({
  position: 'absolute',
  left: 0,
  top: 'calc(100% + 0.67em)',
  zIndex: theme.zIndexes.episodes,
  display: 'grid',

  gridTemplateColumns: '50% 50%',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  boxShadow: theme.boxShadow,
  opacity: 0,
  filter: 'blur(10px)',
  visibility: 'hidden',
  transition: 'all 0.3s',

  [`&.${IS_OPEN}`]: {
    opacity: 1,
    filter: 'blur(0)',
    visibility: 'visible',
  },
})

const EpisodesHalf = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: `${theme.Header.link.padding.top} 1.33em 0`,
})

const EpisodeUnknown = styled.div({
  gridColumn: '1 / span 2',
  display: 'flex',
  justifyContent: 'center',
  padding: `0 0.67em ${theme.Header.link.padding.top}`,
})
