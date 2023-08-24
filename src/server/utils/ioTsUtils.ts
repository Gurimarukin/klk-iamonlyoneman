import { predicate, string } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { Decoder } from 'io-ts/Decoder'
import { List, Maybe, NonEmptyArray } from '../../shared/utils/fp'

/**
 * ArrayFromString
 */

const prepareArray: (i: string) => List<string> = flow(
  string.split(','),
  NonEmptyArray.map(string.trim),
  List.filter(predicate.not(string.isEmpty)),
)

/**
 * BooleanFromString
 */

const booleanFromStringDecoder: Decoder<unknown, boolean> = pipe(
  D.string,
  D.parse(s =>
    s === 'true'
      ? D.success(true)
      : s === 'false'
      ? D.success(false)
      : D.failure(s, 'BooleanFromString'),
  ),
)

export const BooleanFromString = { decoder: booleanFromStringDecoder }

/**
 * NonEmptyArrayFromString
 */

const nonEmptyArrayFromStringDecoder = <A>(
  decoder: Decoder<unknown, A>,
): Decoder<unknown, NonEmptyArray<A>> =>
  pipe(D.string, D.map(prepareArray), D.compose(NonEmptyArray.decoder(decoder)))

export const NonEmptyArrayFromString = { decoder: nonEmptyArrayFromStringDecoder }

/**
 * URLFromString
 */

const urlFromStringDecoder: Decoder<unknown, URL> = pipe(
  D.string,
  D.parse(s =>
    pipe(
      Maybe.tryCatch(() => new URL(s)),
      Maybe.fold(() => D.failure(s, 'URLFromString'), D.success),
    ),
  ),
)

export const URLFromString = { decoder: urlFromStringDecoder }
