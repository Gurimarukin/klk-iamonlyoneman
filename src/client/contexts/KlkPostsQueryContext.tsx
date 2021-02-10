import { pipe } from 'fp-ts/function'
import React, { createContext, useContext, useMemo } from 'react'

import { PartialKlkPostQuery } from '../../shared/models/PartialKlkPostQuery'
import { Either } from '../../shared/utils/fp'
import { useHistory } from './HistoryContext'

const KlkPostsQueryContext = createContext<PartialKlkPostQuery | undefined>(undefined)

export const KlkPostsQueryContextProvider: React.FC = ({ children }) => {
  const { query } = useHistory()

  const value: PartialKlkPostQuery = useMemo(
    () =>
      pipe(
        PartialKlkPostQuery.decoder.decode(query),
        Either.getOrElse(() => ({})),
      ),
    [query],
  )

  return <KlkPostsQueryContext.Provider value={value}>{children}</KlkPostsQueryContext.Provider>
}

export const useKlkPostsQuery = (): PartialKlkPostQuery => {
  const context = useContext(KlkPostsQueryContext)
  if (context === undefined) {
    // eslint-disable-next-line functional/no-throw-statement
    throw Error('useKlkPostsQuery must be used within a KlkPostsQueryContextProvider')
  }
  return context
}
