import React, { useCallback } from 'react'

import { useHistory } from '../contexts/HistoryContext'

interface Props {
  to: string
  target?: string
  className?: string
}

export const Link: React.FC<Props> = ({ to, target, className, children }) => {
  const { navigate } = useHistory()

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      navigate(to)
    },
    [navigate, to],
  )

  return (
    <a href={to} onClick={onClick} target={target} className={className}>
      {children}
    </a>
  )
}
