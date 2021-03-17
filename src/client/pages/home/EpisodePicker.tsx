import styled from '@emotion/styled'
import { pipe } from 'fp-ts/function'
import React from 'react'

import { EpisodeNumber } from '../../../shared/models/PartialKlkPostsQuery'
import { List, Maybe } from '../../../shared/utils/fp'
import { StringUtils } from '../../../shared/utils/StringUtils'
import { Picker } from '../../components/Picker'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { theme } from '../../utils/theme'
import { HomeLink } from './Header'

const unknownLabel = 'unknown'

export const EpisodePicker = (): JSX.Element => {
  const query = useKlkPostsQuery()
  return (
    <StyledPicker
      labelPrefix={'episode:'}
      labelValue={pipe(
        query.episode,
        Maybe.map(e => (e === 'unknown' ? unknownLabel : StringUtils.pad10(e))),
        Maybe.getOrElse(() => '–'),
      )}
      valueIsSelected={Maybe.isSome(query.episode)}
      content={
        <Container>
          <EpisodesHalf>
            {List.range(1, 12).map(n => (
              <HomeLink key={n} to={{ episode: Maybe.some(n), sortNew: false }}>
                {StringUtils.pad10(n)}
              </HomeLink>
            ))}
          </EpisodesHalf>
          <EpisodesHalf>
            {List.range(13, 24).map(n => (
              <HomeLink key={n} to={{ episode: Maybe.some(n), sortNew: false }}>
                {StringUtils.pad10(n)}
              </HomeLink>
            ))}
          </EpisodesHalf>
          <EpisodeCenter>
            <HomeLink to={{ episode: Maybe.some(25), sortNew: false }}>25</HomeLink>
          </EpisodeCenter>
          <EpisodeCenter>
            <HomeLink to={{ episode: Maybe.some(EpisodeNumber.unknown), sortNew: false }}>
              {unknownLabel}
            </HomeLink>
          </EpisodeCenter>
        </Container>
      }
    />
  )
}

const StyledPicker = styled(Picker)({
  [theme.mediaQueries.mobile]: {
    gridColumnEnd: 'span 2',
    justifySelf: 'end',
  },
})

const Container = styled.div({
  display: 'grid',
  gridTemplateColumns: '50% 50%',
})

const EpisodesHalf = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: `${theme.Header.link.padding.top} 1.33em 0`,
})

const EpisodeCenter = styled.div({
  gridColumnEnd: 'span 2',
  display: 'flex',
  justifyContent: 'center',
  padding: `0 0.67em ${theme.Header.link.padding.top}`,
})
