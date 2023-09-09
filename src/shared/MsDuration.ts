import { either, option, predicate } from 'fp-ts'
import { Option } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { Decoder } from 'io-ts/Decoder'
import type { StringValue } from 'ms'
import vercelMs from 'ms'
import { Newtype, iso } from 'newtype-ts'

type MsDuration = Newtype<{ readonly MsDuration: unique symbol }, number>

const { wrap, unwrap } = iso<MsDuration>()

const fromStringDecoder: Decoder<unknown, MsDuration> = pipe(
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

const seconds = (n: number): MsDuration => wrap(1000 * n)
const minutes = (n: number): MsDuration => seconds(60 * n)
const hours = (n: number): MsDuration => minutes(60 * n)
const days = (n: number): MsDuration => hours(24 * n)

const MsDuration = { fromStringDecoder, unwrap, seconds, minutes, hours, days }

export { MsDuration }
