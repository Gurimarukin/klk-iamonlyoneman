import { useCallback, useRef } from 'react'

import { Maybe, Tuple } from '../../shared/utils/fp'

type MaybeRef<A> = Tuple<React.MutableRefObject<Maybe<A>>, (elt: A | null) => Maybe<A>>

export function useMaybeRef<A>(): MaybeRef<A> {
  const refObject = useRef<Maybe<A>>(Maybe.none)
  const refCallback = useCallback(
    // eslint-disable-next-line functional/immutable-data
    (elt: A | null) => (refObject.current = Maybe.fromNullable(elt)),
    [],
  )

  return [refObject, refCallback]
}
