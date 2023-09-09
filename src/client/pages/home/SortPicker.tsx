import styled from '@emotion/styled'

import { Picker } from '../../components/Picker'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { theme } from '../../utils/theme'
import { HomeLink } from './HomeLink'

type Props = {
  className?: string
}

const labelSort = 'sort:'
const labelNew = 'new'
const labelOld = 'old'

export const SortPicker = ({ className }: Props): JSX.Element => {
  const query = useKlkPostsQuery()
  return (
    <Picker
      labelPrefix={labelSort}
      labelValue={query.sortNew ? labelNew : labelOld}
      valueIsSelected={false}
      className={className}
    >
      <Container>
        <HomeLink to={{ sortNew: true }} compareOnlySort={true}>
          {labelNew}
        </HomeLink>
        <HomeLink to={{ sortNew: false }} compareOnlySort={true}>
          {labelOld}
        </HomeLink>
      </Container>
    </Picker>
  )
}

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.Header.link.padding.top,
})
