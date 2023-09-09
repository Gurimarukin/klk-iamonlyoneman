import { apply } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'

import { MsDuration } from '../MsDuration'
import { Maybe, Tuple, Tuple3 } from './fp'

const isEmpty = (str: string): boolean => str === ''

const isString = (u: unknown): u is string => typeof u === 'string'

const margin = /^[^\n\S]*\|/gm
const stripMargins = (str: string): string => str.replace(margin, '')

const ellipse =
  (take: number) =>
  (str: string): string =>
    str.length > take ? `${str.substring(0, take)}...` : str

const matcher =
  <A>(regex: RegExp, f: (arr: RegExpMatchArray) => Maybe<A>) =>
  (str: string): Maybe<A> =>
    pipe(str.match(regex), Maybe.fromNullable, Maybe.chain(f))

const matches = (regex: RegExp): ((str: string) => boolean) =>
  flow(matcher(regex, Maybe.some), Maybe.isSome)

const matcher1 = (regex: RegExp): ((str: string) => Maybe<string>) =>
  matcher(regex, ([, _]) => Maybe.fromNullable(_))

const matcher2 = (regex: RegExp): ((str: string) => Maybe<Tuple<string, string>>) =>
  matcher(regex, ([, a, b]) =>
    apply.sequenceT(Maybe.Apply)(Maybe.fromNullable(a), Maybe.fromNullable(b)),
  )

const matcher3 = (regex: RegExp): ((str: string) => Maybe<Tuple3<string, string, string>>) =>
  matcher(regex, ([, a, b, c]) =>
    apply.sequenceT(Maybe.Apply)(
      Maybe.fromNullable(a),
      Maybe.fromNullable(b),
      Maybe.fromNullable(c),
    ),
  )

const padStart =
  (maxLength: number) =>
  (n: number): string =>
    `${n}`.padStart(maxLength, '0')

const pad10 = padStart(2)
const pad100 = padStart(3)

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = pad10(date.getMonth() + 1)
  const day = pad10(date.getDate())
  const hours = pad10(date.getHours())
  const minutes = pad10(date.getMinutes())

  return `${year}/${month}/${day}, ${hours}:${minutes}`
}

const prettyMs = (ms: MsDuration): string => {
  const date = new Date(MsDuration.unwrap(ms))

  const d = date.getDate()
  const h = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  const ms_ = date.getMilliseconds()

  if (d !== 0) return `${d}d${pad10(h)}h${pad10(m)}'${pad10(s)}.${pad100(ms_)}"`
  if (h !== 0) return `${pad10(h)}h${pad10(m)}'${pad10(s)}.${pad100(ms_)}"`
  if (m !== 0) return `${pad10(m)}'${pad10(s)}.${pad100(ms_)}"`
  return `${pad10(s)}.${pad100(ms_)}"`
}

export const StringUtils = {
  ellipse,
  formatDate,
  isEmpty,
  isString,
  matcher1,
  matcher2,
  matcher3,
  matches,
  pad10,
  prettyMs,
  stripMargins,
}
