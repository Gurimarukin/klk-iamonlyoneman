/* eslint-disable functional/no-expression-statement */
import styled from '@emotion/styled'
import { eq } from 'fp-ts'
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { KlkPostsQuery } from '../../../shared/models/KlkPostsQuery'
import { Maybe } from '../../../shared/utils/fp'
import { s } from '../../../shared/utils/StringUtils'
import { Search, Times } from '../../components/svgs'
import { useHistory } from '../../contexts/HistoryContext'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { routes } from '../../Router'
import { theme } from '../../utils/theme'

const maybeStringEq: Eq<Maybe<string>> = Maybe.getEq(eq.eqString)

export const SearchInput = (): JSX.Element => {
  const { navigate } = useHistory()
  const query = useKlkPostsQuery()

  const defaultSearch = useMemo(
    () =>
      pipe(
        query.search,
        Maybe.getOrElse(() => ''),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [search, setSearch] = useState(defaultSearch)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [],
  )

  useEffect(() => setSearch(defaultSearch), [defaultSearch, query])

  const navigateSearch = useCallback(
    (rawSearch: string | undefined) => {
      const newSearch = pipe(
        Maybe.fromNullable(rawSearch?.trim()),
        Maybe.filter(str => str !== ''),
      )
      if (!maybeStringEq.equals(newSearch, query.search)) {
        pipe({ ...query, search: newSearch }, KlkPostsQuery.toPartial, routes.home, navigate)
      }
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
  padding: s`${theme.Header.link.padding.top} ${theme.Header.link.padding.left}`,
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  display: 'flex',
  filter: s`drop-shadow(1px 1px 0 ${theme.colors.darkgrey})`,
  cursor: 'pointer',

  '&::after': {
    content: "''",
    position: 'absolute',
    width: s`calc(100% - 2 * ${theme.Header.link.padding.left})`,
    borderBottom: s`2px solid ${theme.colors.lime}`,
    left: theme.Header.link.padding.left,
    bottom: s`calc(${theme.Header.link.padding.top} - 4px)`,
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
    content: "''",
    width: s`calc(100% - 2 * ${theme.Header.link.padding.left})`,
    position: 'absolute',
    left: theme.Header.link.padding.left,
    bottom: theme.Header.link.padding.top,
    borderBottom: s`1px solid ${theme.colors.white}`,
  },
})

const StyledInput = styled.input({
  width: 200,
  border: 'none',
  padding: s`0 ${theme.Header.link.padding.left}`,
  background: 'none',
  font: 'inherit',
  fontWeight: 'normal',
  color: 'inherit',

  '&:focus': {
    outline: s`1px dashed ${theme.colors.lime}`,
  },
})

const ResetButton = styled(UnstyledButton)({
  position: 'absolute',
  right: 0,

  '& > svg': {
    width: '0.8em',
  },
})
