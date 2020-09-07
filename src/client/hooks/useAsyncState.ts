import { useCallback, useEffect, useState } from 'react'

import { Future, Task, flow, pipe } from '../../shared/utils/fp'
import { AsyncState } from '../models/AsyncState'

type Update<A> = (f: (a: A) => A) => void

export function useAsyncState<A>(key: string, future: Future<A>): [AsyncState<A>, Update<A>] {
  const [state, setState] = useState<AsyncState<A>>(AsyncState.Loading)

  useEffect(() => {
    pipe(future, Task.chain(flow(AsyncState.fromTry, setState, Future.right)), Future.runUnsafe)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update: Update<A> = useCallback(f => setState(AsyncState.map(f)), [])

  return [state, update]
}
