import { Location, createBrowserHistory } from 'history'
import qs from 'qs'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type HistoryContext = Readonly<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  location: Location<object | null>
  navigate: (to: string) => never
  query: qs.ParsedQs
}>

const HistoryContext = createContext<HistoryContext | undefined>(undefined)

export const HistoryContextProvider: React.FC = ({ children }) => {
  const history = useMemo(() => createBrowserHistory(), [])

  const [location, setLocation] = useState(history.location)
  useEffect(() => history.listen(location => setLocation(location.location)), [history])

  const navigate = useCallback(
    (to: string): never =>
      history.push({
        pathname: to,
        search: '',
        hash: '',
      }) as never,
    [history],
  )

  const query = useMemo(() => qs.parse(location.search.slice(1)), [location.search])

  const value: HistoryContext = { location, navigate, query }

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export const useHistory = (): HistoryContext => {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryContextProvider')
  }
  return context
}
