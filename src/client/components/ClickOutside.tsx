import React, { cloneElement, createRef, useCallback, useEffect } from 'react'

type Props = Readonly<{
  onClickOutside: (e: MouseEvent) => void
}>

export const ClickOutside: React.FC<Props> = ({ onClickOutside, children }) => {
  const refs = React.Children.map(children, _ => createRef<Node>())

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const isOutside = (refs as React.RefObject<Node>[]).every(
        ref => ref.current !== null && !ref.current.contains(e.target as Node),
      )
      if (isOutside) onClickOutside(e)
    },
    [onClickOutside, refs],
  )

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [handleClick])

  return (React.Children.map(children, (elt, idx) =>
    cloneElement(elt as React.ReactElement, { ref: (refs as React.RefObject<Node>[])[idx] }),
  ) as unknown) as React.ReactElement
}
