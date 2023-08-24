/* eslint-disable functional/no-expression-statement */
import styled from '@emotion/styled'
import { eq } from 'fp-ts'
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import React, { useCallback, useEffect, useState } from 'react'

import { KlkPostsQuery } from '../../../shared/models/KlkPostsQuery'
import { Maybe } from '../../../shared/utils/fp'

import { routes } from '../../Router'
import { Search, Times } from '../../components/svgs'
import { useHistory } from '../../contexts/HistoryContext'
import { useKlkPostsQuery } from '../../contexts/KlkPostsQueryContext'
import { theme } from '../../utils/theme'

type Props = {
  readonly className?: string
}

const maybeStringEq: Eq<Maybe<string>> = Maybe.getEq(eq.eqString)

export const SearchInput = ({ className }: Props): JSX.Element => {
  const { navigate } = useHistory()
  const query = useKlkPostsQuery()

  const [search, setSearch] = useState('')
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [],
  )

  useEffect(
    () =>
      pipe(
        query.search,
        Maybe.getOrElse(() => ''),
        setSearch,
      ),
    [query],
  )

  const navigateSearch = useCallback(
    (rawSearch: string | undefined) => {
      const { search: newSearch } = KlkPostsQuery.fromPartial({ search: rawSearch })
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
    <StyledForm onSubmit={handleSubmit} className={className}>
      <InputContainer>
        <StyledInput value={search} onChange={handleChange} placeholder="search" />
        <ResetButton type="reset" onClick={resetAll}>
          <Times />
        </ResetButton>
      </InputContainer>
      <UnstyledButton type="submit">
        <Search />
      </UnstyledButton>
    </StyledForm>
  )
}

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
    content: "''",
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
    content: "''",
    width: `calc(100% - 2 * ${theme.Header.link.padding.left})`,
    position: 'absolute',
    left: theme.Header.link.padding.left,
    bottom: theme.Header.search.underline.bottom,
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
