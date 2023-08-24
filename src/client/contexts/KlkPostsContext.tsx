/* eslint-disable functional/no-return-void */
import React, { createContext, useContext } from 'react'

import { KlkPostDAO } from '../../shared/models/klkPost/KlkPostDAO'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'

type KlkPostsContext = {
  readonly updateById: (id: KlkPostId, post: KlkPostDAO) => void
}

const KlkPostsContext = createContext<KlkPostsContext | undefined>(undefined)

type Props = {
  readonly updateById: (id: KlkPostId, post: KlkPostDAO) => void
}

export const KlkPostsContextProvider: React.FC<Props> = ({ updateById, children }) => {
  const value: KlkPostsContext = { updateById }

  return <KlkPostsContext.Provider value={value}>{children}</KlkPostsContext.Provider>
}

export const useKlkPosts = (): KlkPostsContext => {
  const context = useContext(KlkPostsContext)
  if (context === undefined) {
    // eslint-disable-next-line functional/no-throw-statements
    throw Error('useKlkPosts must be used within a KlkPostsContextProvider')
  }
  return context
}
