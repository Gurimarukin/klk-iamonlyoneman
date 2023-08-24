import { pipe } from 'fp-ts/function'

import { Either, Future, IO, Task } from '../../shared/utils/fp'

import { MsDuration } from '../models/MsDuration'

type OnComplete<A> = {
  readonly onFailure: (e: Error) => IO<void>
  readonly onSuccess: (a: A) => IO<void>
}

export namespace FutureUtils {
  export function retryIfFailed<A>(
    delay: MsDuration,
    onComplete: OnComplete<A>,
  ): (f: Future<A>) => Future<A> {
    return f => retryIfFailedRec(f, delay, onComplete, true)
  }
}

function retryIfFailedRec<A>(
  f: Future<A>,
  delay: MsDuration,
  onComplete: OnComplete<A>,
  firstTime: boolean,
): Future<A> {
  const { onFailure, onSuccess } = onComplete
  return pipe(
    f,
    Task.chain(
      Either.fold(
        e =>
          pipe(
            firstTime ? onFailure(e) : IO.unit,
            Future.fromIOEither,
            Future.chain(() => retryIfFailedRec(f, delay, onComplete, false)),
            Future.delay(delay),
          ),
        a =>
          pipe(
            Future.fromIOEither(onSuccess(a)),
            Future.map(() => a),
          ),
      ),
    ),
  )
}
