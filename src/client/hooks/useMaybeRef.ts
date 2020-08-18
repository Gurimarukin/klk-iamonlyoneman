import { useRef, useCallback } from 'react'

import { Maybe } from '../../shared/utils/fp'

type MaybeRef<A> = [React.MutableRefObject<Maybe<A>>, (elt: A | null) => Maybe<A>]

export function useMaybeRef<A>(): MaybeRef<A> {
  const refObject = useRef<Maybe<A>>(Maybe.none)
  const refCallback = useCallback(
    (elt: A | null) => (refObject.current = Maybe.fromNullable(elt)),
    [],
  )

  return [refObject, refCallback]
}
