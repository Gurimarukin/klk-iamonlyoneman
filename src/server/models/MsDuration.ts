import { Newtype, iso } from 'newtype-ts'

import { either, option, predicate } from 'fp-ts'
import { Option } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { Decoder } from 'io-ts/Decoder'
import type { StringValue } from 'ms'
import vercelMs from 'ms'

import * as D from 'io-ts/Decoder'

export type MsDuration = Newtype<{ readonly MsDuration: unique symbol }, number>

const isoMsDuration = iso<MsDuration>()

export namespace MsDuration {
  const wrap = isoMsDuration.wrap
  export const unwrap = isoMsDuration.unwrap

  export const fromStringDecoder: Decoder<unknown, MsDuration> = pipe(
    D.string,
    D.parse(str =>
      pipe(
        fromString(str),
        either.fromOption(() => D.error(str, 'MsDuration')),
      ),
    ),
  )

  const fromString = (str: string): Option<MsDuration> =>
    pipe(
      option.tryCatch(() => vercelMs(str as StringValue)),
      option.filter(predicate.not(isNaN)),
      option.map(wrap),
    )

  export const seconds = (n: number): MsDuration => wrap(1000 * n)
  export const minutes = (n: number): MsDuration => seconds(60 * n)
  export const hours = (n: number): MsDuration => minutes(60 * n)
  export const days = (n: number): MsDuration => hours(24 * n)
}
