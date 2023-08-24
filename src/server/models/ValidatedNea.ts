import { apply } from 'fp-ts'
import { Applicative2C } from 'fp-ts/Applicative'

import { Dict, Either, NonEmptyArray } from '../../shared/utils/fp'

type ValidatedNea<E, A> = Either<NonEmptyArray<E>, A>

const getValidation = <E = never>(): Applicative2C<'Either', NonEmptyArray<E>> =>
  Either.getApplicativeValidation(NonEmptyArray.getSemigroup<E>())

type ToValidatedDict<E, A extends Dict<string, unknown>> = {
  [K in keyof A]: ValidatedNea<E, A[K]>
}

type SeqS<E> = <A extends Dict<string, unknown>>(a: ToValidatedDict<E, A>) => ValidatedNea<E, A>

const getSeqS = <E = never>(): SeqS<E> => apply.sequenceS(getValidation<E>()) as SeqS<E>

const ValidatedNea = {
  getSeqS,
}

export { ValidatedNea }
