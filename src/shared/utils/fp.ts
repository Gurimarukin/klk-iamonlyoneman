import {
  either,
  io,
  ioEither,
  option,
  readonlyArray,
  readonlyNonEmptyArray,
  readonlyRecord,
  readonlyTuple,
  task,
  taskEither,
} from 'fp-ts'
import { Lazy, flow, pipe } from 'fp-ts/function'
import * as C_ from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as E_ from 'io-ts/Encoder'

import { MsDuration } from '../../server/models/MsDuration'

export const unknownToError = (e: unknown): Error =>
  e instanceof Error ? e : Error('unknown error')

export const todo = (...[]: List<unknown>): never => {
  // eslint-disable-next-line functional/no-throw-statement
  throw Error('Missing implementation')
}

export const inspect = (...label: List<unknown>) => <A>(a: A): A => {
  console.log(...label, a)
  return a
}

export type Dict<K extends string, A> = readonlyRecord.ReadonlyRecord<K, A>
export const Dict = readonlyRecord

export type Either<E, A> = either.Either<E, A>
export const Either = either

export type Maybe<A> = option.Option<A>
const maybeDecoder = <I, A>(decoder: D.Decoder<I, A>): D.Decoder<I, Maybe<A>> => ({
  decode: (u: I) =>
    u === null || u === undefined
      ? D.success(option.none)
      : pipe(decoder.decode(u), either.map(option.some)),
})
const maybeEncoder = <O, A>(encoder: E_.Encoder<O, A>): E_.Encoder<O | null, Maybe<A>> => ({
  encode: flow(option.map(encoder.encode), option.toNullable),
})
export const Maybe = {
  ...option,
  toArray: <A>(opt: Maybe<A>): List<A> =>
    pipe(
      opt,
      option.fold(
        () => [],
        _ => [_],
      ),
    ),
  decoder: maybeDecoder,
  encoder: maybeEncoder,
  codec: <O, A>(codec: C_.Codec<unknown, O, A>): C_.Codec<unknown, O | null, Maybe<A>> =>
    C_.make(maybeDecoder(codec), maybeEncoder(codec)),
}

export type NonEmptyArray<A> = readonlyNonEmptyArray.ReadonlyNonEmptyArray<A>
const neaDecoder = <A>(codec: D.Decoder<unknown, A>): D.Decoder<unknown, NonEmptyArray<A>> =>
  pipe(D.array(codec), D.refine<List<A>, NonEmptyArray<A>>(List.isNonEmpty, 'NonEmptyArray'))
const neaEncoder = <O, A>(
  codec: E_.Encoder<O, A>,
): E_.Encoder<NonEmptyArray<O>, NonEmptyArray<A>> => ({
  encode: a => pipe(a, NonEmptyArray.map(codec.encode)),
})
export const NonEmptyArray = {
  ...readonlyNonEmptyArray,
  decoder: neaDecoder,
  encoder: neaEncoder,
  codec: <O, A>(
    codec: C_.Codec<unknown, O, A>,
  ): C_.Codec<unknown, NonEmptyArray<O>, NonEmptyArray<A>> =>
    C_.make(neaDecoder(codec), neaEncoder(codec)),
}

export type List<A> = ReadonlyArray<A>
export const List = {
  ...readonlyArray,
  isEmpty: <A>(l: List<A>): l is readonly [] => readonlyArray.isEmpty(l),
  concat: <A>(a: List<A>, b: List<A>): List<A> => [...a, ...b],
}

export type Tuple<A, B> = readonly [A, B]
export const Tuple = {
  ...readonlyTuple,
  of: <A, B>(a: A, b: B): Tuple<A, B> => [a, b],
}

export type Tuple3<A, B, C> = readonly [A, B, C]

const unknownAsError = (e: unknown): Error => e as Error

export type Try<A> = Either<Error, A>
export const Try = {
  ...either,
  right: <A>(a: A): Try<A> => Either.right(a),
  left: <A = never>(e: Error): Try<A> => Either.left(e),
  tryCatch: <A>(a: Lazy<A>): Try<A> => Either.tryCatch(a, unknownAsError),
  get: <A>(t: Try<A>): A =>
    pipe(
      t,
      Either.getOrElse<Error, A>(e => {
        // eslint-disable-next-line functional/no-throw-statement
        throw e
      }),
    ),
}

export type Task<A> = task.Task<A>
export const Task = {
  ...task,
  run: <A>(fa: Task<A>): Promise<A> => fa(),
}

const futureRight = <A>(a: A): Future<A> => taskEither.right(a)
export type Future<A> = task.Task<Try<A>>
export const Future = {
  ...taskEither,
  right: futureRight,
  left: <A = never>(e: Error): Future<A> => taskEither.left(e),
  tryCatch: <A>(f: Lazy<Promise<A>>): Future<A> => taskEither.tryCatch(f, unknownAsError),
  unit: futureRight<void>(undefined),
  recover: <A>(onError: (e: Error) => Future<A>): ((future: Future<A>) => Future<A>) =>
    task.chain(either.fold(onError, futureRight)),
  runUnsafe: <A>(fa: Future<A>): Promise<A> => pipe(fa, task.map(Try.get))(),
  delay: <A>(ms: MsDuration) => (future: Future<A>): Future<A> =>
    pipe(future, task.delay(MsDuration.unwrap(ms))),
}

const ioTryCatch = <A>(a: Lazy<A>): IO<A> => ioEither.tryCatch(a, unknownAsError)
export type IO<A> = io.IO<Try<A>>
export const IO = {
  ...ioEither,
  tryCatch: ioTryCatch,
  unit: ioEither.right<never, void>(undefined),
  runFuture: <A>(f: Future<A>): IO<void> =>
    ioTryCatch(() => {
      // eslint-disable-next-line functional/no-expression-statement
      Future.runUnsafe(f)
    }),
  runUnsafe: <A>(ioA: IO<A>): A => Try.get(ioA()),
}
