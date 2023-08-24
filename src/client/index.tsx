import * as ReactDOM from 'react-dom'

import { App } from './App'
import { HistoryContextProvider } from './contexts/HistoryContext'
import { KlkPostsQueryContextProvider } from './contexts/KlkPostsQueryContext'
import { UserContextProvider } from './contexts/UserContext'

// eslint-disable-next-line functional/no-expression-statements
ReactDOM.render(
  <HistoryContextProvider>
    <KlkPostsQueryContextProvider>
      <UserContextProvider>
        <App />
      </UserContextProvider>
    </KlkPostsQueryContextProvider>
  </HistoryContextProvider>,
  document.getElementById('root'),
)
