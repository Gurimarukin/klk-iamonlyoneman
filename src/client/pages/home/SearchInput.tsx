/* eslint-disable functional/no-expression-statement */
import styled from '@emotion/styled'
import React, { useCallback, useEffect, useState } from 'react'

import { Search, Times } from '../../components/svgs'
import { useHistory } from '../../contexts/HistoryContext'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { routes } from '../../Router'
import { theme } from '../../utils/theme'

export const SearchInput = (): JSX.Element => {
  const { navigate } = useHistory()
  const query = useKlkPostsQuery()

  const defaultSearch = query.search ?? ''

  const [search, setSearch] = useState(defaultSearch)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSearch(defaultSearch), [query])

  const navigateSearch = useCallback(
    (rawSearch: string | undefined) => {
      const trimed = rawSearch?.trim()
      const search_ = trimed === '' ? undefined : trimed
      if (search_ !== query.search) navigate(routes.home({ ...query, search: search_ }))
    },
    [navigate, query],
  )

  const resetAll = useCallback(() => {
    setSearch('')
    navigateSearch(undefined)
  }, [navigateSearch])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      navigateSearch(search)
    },
    [navigateSearch, search],
  )

  return (
    <Container>
      <StyledForm onSubmit={handleSubmit}>
        <InputContainer>
          <StyledInput value={search} onChange={handleChange} placeholder='search' />
          <ResetButton type='reset' onClick={resetAll}>
            <Times />
          </ResetButton>
        </InputContainer>
        <UnstyledButton type='submit'>
          <Search />
        </UnstyledButton>
      </StyledForm>
    </Container>
  )
}

const Container = styled.div({
  [theme.mediaQueries.mobile]: {
    gridColumnEnd: 'span 2',
  },
})

const UnstyledButton = styled.button({
  border: 'none',
  borderRadius: 2,
  padding: `${theme.Header.link.padding.top} ${theme.Header.link.padding.left}`,
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  display: 'flex',
  filter: `drop-shadow(1px 1px 0 ${theme.colors.darkgrey})`,
  cursor: 'pointer',

  '&::after': {
    content: `''`,
    position: 'absolute',
    width: `calc(100% - 2 * ${theme.Header.link.padding.left})`,
    borderBottom: `2px solid ${theme.colors.lime}`,
    left: theme.Header.link.padding.left,
    bottom: `calc(${theme.Header.link.padding.top} - 4px)`,
    opacity: 0,
    transition: 'all 0.3s',
  },

  '&:hover::after': {
    opacity: 1,
  },

  '& > svg': {
    height: '1.1em',
  },
})

const StyledForm = styled.form({
  display: 'flex',
  alignItems: 'center',
})

const InputContainer = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',

  '&::after': {
    content: `''`,
    width: `calc(100% - 2 * ${theme.Header.link.padding.left})`,
    position: 'absolute',
    left: theme.Header.link.padding.left,
    bottom: theme.Header.link.padding.top,
    borderBottom: `1px solid ${theme.colors.white}`,
  },
})

const StyledInput = styled.input({
  width: 200,
  border: 'none',
  padding: `0 ${theme.Header.link.padding.left}`,
  background: 'none',
  font: 'inherit',
  fontWeight: 'normal',
  color: 'inherit',

  '&:focus': {
    outline: `1px dashed ${theme.colors.lime}`,
  },
})

const ResetButton = styled(UnstyledButton)({
  position: 'absolute',
  right: 0,

  '& > svg': {
    width: '0.8em',
  },
})
