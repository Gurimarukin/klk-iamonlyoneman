import styled from '@emotion/styled'
import React from 'react'

import { Picker } from '../../components/Picker'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { theme } from '../../utils/theme'
import { HomeLink } from './Header'

const labelSort = 'sort:'
const labelNew = 'new'
const labelOld = 'old'

export const SortPicker = (): JSX.Element => {
  const query = useKlkPostsQuery()

  return (
    <Picker
      labelPrefix={labelSort}
      labelValue={query.sortNew ? labelNew : labelOld}
      valueIsSelected={false}
      content={
        <Container>
          <HomeLink to={{ sortNew: true }} compareOnlySort={true}>
            {labelNew}
          </HomeLink>
          <HomeLink to={{ sortNew: false }} compareOnlySort={true}>
            {labelOld}
          </HomeLink>
        </Container>
      }
    />
  )
}

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.Header.link.padding.top,
})
