import { Either, Try, pipe } from '../../shared/utils/fp'

export type AsyncState<A> = AsyncState.Loading | AsyncState.Failure | AsyncState.Success<A>

export namespace AsyncState {
  // Loading

  export interface Loading {
    readonly _tag: 'Loading'
  }

  export const Loading: AsyncState<never> = { _tag: 'Loading' }

  export function isLoading<A>(state: AsyncState<A>): state is Loading {
    return state._tag === 'Loading'
  }

  // Failure

  export interface Failure {
    readonly _tag: 'Failure'
    readonly error: Error
  }

  export function Failure(error: Error): AsyncState<never> {
    return { _tag: 'Failure', error }
  }

  export function isFailure<A>(state: AsyncState<A>): state is Failure {
    return state._tag === 'Failure'
  }

  // Success

  export interface Success<A> {
    readonly _tag: 'Success'
    readonly value: A
  }

  export function Success<A>(value: A): AsyncState<A> {
    return { _tag: 'Success', value }
  }

  export function isSuccess<A>(state: AsyncState<A>): state is Success<A> {
    return state._tag === 'Success'
  }

  // methods

  export function fold<A, B>({
    onLoading,
    onFailure,
    onSuccess,
  }: FoldArgs<A, B>): (state: AsyncState<A>) => B {
    return state => {
      switch (state._tag) {
        case 'Loading':
          return onLoading()
        case 'Failure':
          return onFailure(state.error)
        case 'Success':
          return onSuccess(state.value)
      }
    }
  }

  export function fromTry<A>(t: Try<A>): AsyncState<A> {
    return pipe(t, Either.fold(Failure, Success))
  }
}

interface FoldArgs<A, B> {
  onLoading: () => B
  onFailure: (error: Error) => B
  onSuccess: (value: A) => B
}
