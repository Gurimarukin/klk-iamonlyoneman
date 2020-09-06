import './css/reset.css'
import './css/react-lazy-load-image.css'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { App } from './App'
import { HistoryContextProvider } from './contexts/HistoryContext'
import { KlkPostsQueryContextProvider } from './contexts/KlkPostsQueryContext'
import { UserContextProvider } from './contexts/UserContext'

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
