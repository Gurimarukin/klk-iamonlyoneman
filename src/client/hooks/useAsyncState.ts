import { useState, useEffect } from 'react'

import { Future, Task, pipe, flow } from '../../shared/utils/fp'

import { AsyncState } from '../models/AsyncState'

export function useAsyncState<A>(
  future: Future<A>,
): [AsyncState<A>, React.Dispatch<React.SetStateAction<AsyncState<A>>>] {
  const [state, setState] = useState<AsyncState<A>>(AsyncState.Loading)

  useEffect(() => {
    pipe(future, Task.chain(flow(AsyncState.fromTry, setState, Future.right)), Future.runUnsafe)
  }, [future])

  return [state, setState]
}
