import { useEffect, useState } from 'react'

import { Future, Task, flow, pipe } from '../../shared/utils/fp'
import { AsyncState } from '../models/AsyncState'

export function useAsyncState<A>(
  key: string,
  future: Future<A>,
): [AsyncState<A>, React.Dispatch<React.SetStateAction<AsyncState<A>>>] {
  const [state, setState] = useState<AsyncState<A>>(AsyncState.Loading)

  useEffect(() => {
    pipe(future, Task.chain(flow(AsyncState.fromTry, setState, Future.right)), Future.runUnsafe)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [state, setState]
}
