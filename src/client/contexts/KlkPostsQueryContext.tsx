import React, { createContext, useContext, useMemo } from 'react'

import { PartialKlkPostQuery } from '../../shared/models/PartialKlkPostQuery'
import { Either, pipe } from '../../shared/utils/fp'
import { useHistory } from './HistoryContext'

const KlkPostsQueryContext = createContext<PartialKlkPostQuery | undefined>(undefined)

export const KlkPostsQueryContextProvider: React.FC = ({ children }) => {
  const { query } = useHistory()

  const value: PartialKlkPostQuery = useMemo(
    () =>
      pipe(
        PartialKlkPostQuery.decoder.decode(query),
        Either.getOrElse(_ => ({})),
      ),
    [query],
  )

  return <KlkPostsQueryContext.Provider value={value}>{children}</KlkPostsQueryContext.Provider>
}

export const useKlkPostsQuery = (): PartialKlkPostQuery => {
  const context = useContext(KlkPostsQueryContext)
  if (context === undefined) {
    throw new Error('useKlkPostsQuery must be used within a KlkPostsQueryContextProvider')
  }
  return context
}
