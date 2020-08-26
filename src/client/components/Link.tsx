import React, { useCallback, useContext } from 'react'

import { HistoryContext } from '../contexts/HistoryContext'

interface Props {
  to: string
  target?: string
  className?: string
}

export const Link: React.FC<Props> = ({ to, target, className, children }) => {
  const history = useContext(HistoryContext)

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      history.push(to)
    },
    [history, to],
  )

  return (
    <a href={to} onClick={onClick} target={target} className={className}>
      {children}
    </a>
  )
}
