import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

import { MsDuration } from '../../shared/MsDuration'
import { Either, Future, IO, NotUsed } from '../../shared/utils/fp'

type OnComplete<A> = {
  readonly onFailure: (e: Error) => IO<NotUsed>
  readonly onSuccess: (a: A) => IO<NotUsed>
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
    task.chain(
      Either.fold(
        e =>
          pipe(
            firstTime ? onFailure(e) : IO.notUsed,
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
