import { Do as _Do } from 'fp-ts-contrib/lib/Do'
import * as _Array from 'fp-ts/lib/Array'
import * as _Either from 'fp-ts/lib/Either'
import {
  Lazy,
  Predicate,
  flow as _flow,
  identity as _identity,
  not as _not,
} from 'fp-ts/lib/function'
import * as _IO from 'fp-ts/lib/IO'
import * as _IOEither from 'fp-ts/lib/IOEither'
import * as _NonEmptyArray from 'fp-ts/lib/NonEmptyArray'
import * as _Option from 'fp-ts/lib/Option'
import { pipe as _pipe } from 'fp-ts/lib/pipeable'
import * as _Record from 'fp-ts/lib/Record'
import * as _Task from 'fp-ts/lib/Task'
import * as _TaskEither from 'fp-ts/lib/TaskEither'
import * as C from 'io-ts/lib/Codec'
import * as D from 'io-ts/lib/Decoder'
import * as E from 'io-ts/lib/Encoder'

import { MsDuration } from '../../server/models/MsDuration'

export const unknownToError = (e: unknown): Error =>
  e instanceof Error ? e : new Error('unknown error')

export const inspect = (...label: unknown[]) => <A>(a: A): A => {
  console.log(...label, a)
  return a
}

/**
 * ???
 */
export const todo = (..._: unknown[]): never => {
  throw Error('missing implementation')
}

/**
 * Array
 */
export const List = {
  ..._Array,

  concat: <A>(a: A[], b: A[]): A[] => [...a, ...b],

  exists: <A>(predicate: Predicate<A>) => (l: A[]): boolean =>
    _pipe(l, List.findIndex(predicate), _Option.isSome),
}

/**
 * NonEmptyArray
 */
export type NonEmptyArray<A> = _NonEmptyArray.NonEmptyArray<A>

function neaDecoder<A>(decoder: D.Decoder<unknown, A>): D.Decoder<unknown, NonEmptyArray<A>> {
  return _pipe(
    D.array(decoder),
    D.refine((a): a is NonEmptyArray<A> => a.length > 0, 'NonEmptyArray'),
  )
}

function neaEncoder<A>(encoder: E.Encoder<A, A>): E.Encoder<A[], NonEmptyArray<A>> {
  return { encode: _ => E.array(encoder).encode(_) }
}

export const NonEmptyArray = {
  ..._NonEmptyArray,

  decoder: neaDecoder,

  encoder: neaEncoder,

  codec: <A>(codec: C.Codec<unknown, A, A>): C.Codec<unknown, A[], NonEmptyArray<A>> =>
    C.make(neaDecoder(codec), neaEncoder(codec)),
}

/**
 * Record
 */
export type Dict<A> = Record<string, A>
export const Dict = {
  ..._Record,

  insertOrUpdateAt: <K extends string, A>(k: K, a: Lazy<A>, update: (a: A) => A) => (
    record: Record<K, A>,
  ): Record<K, A> =>
    _pipe(
      _Record.lookup(k, record),
      _Option.fold(
        () => _pipe(record, _Record.insertAt(k, a())),
        _ => _pipe(record, _Record.insertAt(k, update(_))),
      ),
    ),
}

/**
 * Option
 */
export type Maybe<A> = _Option.Option<A>

function optDecoder<I, A>(decoder: D.Decoder<I, A>): D.Decoder<I, Maybe<A>> {
  return {
    decode: (u: I) =>
      u === null || u === undefined
        ? D.success(_Option.none)
        : _pipe(decoder.decode(u), _Either.map(_Option.some)),
  }
}

function optEncoder<A>(encoder: E.Encoder<A, A>): E.Encoder<A | null, Maybe<A>> {
  return { encode: _flow(_Option.map(encoder.encode), _Option.toNullable) }
}

export const Maybe = {
  ..._Option,

  toArray: <A>(opt: Maybe<A>): A[] =>
    _pipe(
      opt,
      _Option.fold(
        () => [],
        _ => [_],
      ),
    ),

  decoder: optDecoder,

  encoder: optEncoder,

  codec: <A>(codec: C.Codec<unknown, A, A>): C.Codec<unknown, A | null, Maybe<A>> =>
    C.make(optDecoder(codec), optEncoder(codec)),
}

/**
 * Either
 */
export type Either<E, A> = _Either.Either<E, A>
export const Either = _Either

/**
 * Try
 */
export type Try<A> = Either<Error, A>
export const Try = {
  ..._Either,

  right: <A>(a: A): Try<A> => Either.right(a),

  apply: <A>(a: Lazy<A>): Try<A> => Either.tryCatch(a, unknownToError),

  get: <A>(t: Try<A>): A =>
    _pipe(
      t,
      Either.getOrElse<Error, A>(e => {
        throw e
      }),
    ),
}

/**
 * Task
 */
export type Task<A> = _Task.Task<A>
export const Task = {
  ..._Task,

  run: <A>(task: Task<A>): Promise<A> => task(),
}

/**
 * Future
 */
export type Future<A> = _Task.Task<Try<A>>
export const Future = {
  ..._TaskEither,

  right: <A>(a: A): Future<A> => _TaskEither.right(a),

  left: <A = never>(e: Error): Future<A> => _TaskEither.left(e),

  apply: <A>(f: Lazy<Promise<A>>): Future<A> => Future.tryCatch(f, unknownToError),

  unit: _TaskEither.right<Error, void>(undefined),

  parallel: <A>(futures: Future<A>[]): Future<A[]> =>
    List.array.sequence(Future.taskEither)(futures),

  sequence: <A>(futures: Future<A>[]): Future<A[]> =>
    List.array.sequence(Future.taskEitherSeq)(futures),

  recover: <A>(onError: (e: Error) => Future<A>): ((future: Future<A>) => Future<A>) =>
    _Task.chain(
      _Either.fold(
        e => onError(e),
        _ => _TaskEither.right(_),
      ),
    ),

  runUnsafe: <A>(future: Future<A>): Promise<A> => _pipe(future, _Task.map(Try.get))(),

  delay: <A>(ms: MsDuration) => (future: Future<A>): Future<A> =>
    _pipe(future, _Task.delay(MsDuration.unwrap(ms))),
}

/**
 * IO
 */
export type IO<A> = _IO.IO<Try<A>>
export const IO = {
  ..._IOEither,

  apply: <A>(a: Lazy<A>): IO<A> => IO.tryCatch(a, unknownToError),

  unit: _IOEither.right(undefined),

  runFuture: <A>(f: Future<A>): IO<void> =>
    IO.apply(() => {
      Future.runUnsafe(f)
    }),

  runUnsafe: <A>(io: IO<A>): A => Try.get(io()),
}

/**
 * function
 */
export const identity = _identity

export const flow = _flow

export const not = _not

/**
 * pipe
 */
export const pipe = _pipe

/**
 * Do
 */
export const Do = _Do
