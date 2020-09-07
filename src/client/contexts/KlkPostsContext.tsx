import React, { createContext, useContext } from 'react'

import { KlkPostDAO } from '../../shared/models/klkPost/KlkPostDAO'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'

type KlkPostsContext = Readonly<{
  updateById: (id: KlkPostId, post: KlkPostDAO) => void
}>

const KlkPostsContext = createContext<KlkPostsContext | undefined>(undefined)

type Props = Readonly<{
  updateById: (id: KlkPostId, post: KlkPostDAO) => void
}>

export const KlkPostsContextProvider: React.FC<Props> = ({ updateById, children }) => {
  const value: KlkPostsContext = { updateById }

  return <KlkPostsContext.Provider value={value}>{children}</KlkPostsContext.Provider>
}

export const useKlkPosts = (): KlkPostsContext => {
  const context = useContext(KlkPostsContext)
  if (context === undefined) {
    throw new Error('useKlkPosts must be used within a KlkPostsContextProvider')
  }
  return context
}
