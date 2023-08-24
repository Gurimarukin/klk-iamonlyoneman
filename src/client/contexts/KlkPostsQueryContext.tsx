import { pipe } from 'fp-ts/function'
import React, { createContext, useContext, useMemo } from 'react'

import { KlkPostsQuery } from '../../shared/models/KlkPostsQuery'
import { PartialKlkPostsQuery } from '../../shared/models/PartialKlkPostsQuery'
import { Either } from '../../shared/utils/fp'

import { useHistory } from './HistoryContext'

const KlkPostsQueryContext = createContext<KlkPostsQuery | undefined>(undefined)

export const KlkPostsQueryContextProvider: React.FC = ({ children }) => {
  const { query } = useHistory()

  const value: KlkPostsQuery = useMemo(
    () =>
      pipe(
        PartialKlkPostsQuery.decoder.decode(query),
        Either.getOrElse(() => ({})),
        KlkPostsQuery.fromPartial,
      ),
    [query],
  )

  return <KlkPostsQueryContext.Provider value={value}>{children}</KlkPostsQueryContext.Provider>
}

export const useKlkPostsQuery = (): KlkPostsQuery => {
  const context = useContext(KlkPostsQueryContext)
  if (context === undefined) {
    // eslint-disable-next-line functional/no-throw-statements
    throw Error('useKlkPostsQuery must be used within a KlkPostsQueryContextProvider')
  }
  return context
}
