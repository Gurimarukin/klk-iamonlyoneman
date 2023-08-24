import { flow, pipe } from 'fp-ts/function'
import type { Decoder } from 'io-ts/Decoder'
import * as D from 'io-ts/Decoder'

import { Dict, Either, List, NonEmptyArray, Try } from '../../../shared/utils/fp'

import { ValidatedNea } from '../../models/ValidatedNea'

export type DecodeKey = <B>(
  decoder: Decoder<unknown, B>,
) => (key: string) => ValidatedNea<string, B>

export const parseConfig = (rawConfig: Partial<Dict<string, string>>) => <A>(
  f: (r: DecodeKey) => ValidatedNea<string, A>,
): Try<A> =>
  pipe(
    f(<B>(decoder: Decoder<unknown, B>) => (key: string) =>
      pipe(
        decoder.decode(rawConfig[key]),
        Either.mapLeft(e => NonEmptyArray.of(`${key}: ${D.draw(e)}`)),
      ),
    ),
    Either.mapLeft(flow(List.mkString('Errors while reading config:\n', '\n', ''), Error)),
  )
