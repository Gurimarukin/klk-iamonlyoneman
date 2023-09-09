import styled from '@emotion/styled'
import { pipe } from 'fp-ts/function'

import { EpisodeNumber } from '../../../shared/models/PartialKlkPostsQuery'
import { StringUtils } from '../../../shared/utils/StringUtils'
import { Maybe, NonEmptyArray } from '../../../shared/utils/fp'

import { Picker } from '../../components/Picker'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { theme } from '../../utils/theme'
import { HomeLink } from './HomeLink'

type Props = {
  className?: string
}

const unknownLabel = 'unknown'

export const EpisodePicker = ({ className }: Props): JSX.Element => {
  const query = useKlkPostsQuery()
  return (
    <Picker
      labelPrefix={'episode:'}
      labelValue={
        <LabelValue>
          {pipe(
            query.episode,
            Maybe.map(e => (e === 'unknown' ? unknownLabel : StringUtils.pad10(e))),
            Maybe.getOrElse(() => '–'),
          )}
        </LabelValue>
      }
      valueIsSelected={Maybe.isSome(query.episode)}
      className={className}
    >
      <Container>
        <EpisodesHalf>
          {NonEmptyArray.range(1, 12).map(n => (
            <HomeLink key={n} to={{ episode: Maybe.some(n), sortNew: false }}>
              {StringUtils.pad10(n)}
            </HomeLink>
          ))}
        </EpisodesHalf>
        <EpisodesHalf>
          {NonEmptyArray.range(13, 24).map(n => (
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
    </Picker>
  )
}

const LabelValue = styled.span({
  fontWeight: 'bold',
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
