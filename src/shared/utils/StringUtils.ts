import { apply } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'

import { MsDuration } from '../MsDuration'
import { Maybe, Tuple, Tuple3 } from './fp'

export namespace StringUtils {
  export const isEmpty = (str: string): boolean => str === ''

  export const isString = (u: unknown): u is string => typeof u === 'string'

  const margin = /^[^\n\S]*\|/gm
  export const stripMargins = (str: string): string => str.replace(margin, '')

  export const ellipse =
    (take: number) =>
    (str: string): string =>
      str.length > take ? `${str.substring(0, take)}...` : str

  const matcher =
    <A>(regex: RegExp, f: (arr: RegExpMatchArray) => Maybe<A>) =>
    (str: string): Maybe<A> =>
      pipe(str.match(regex), Maybe.fromNullable, Maybe.chain(f))

  export const matches = (regex: RegExp): ((str: string) => boolean) =>
    flow(matcher(regex, Maybe.some), Maybe.isSome)

  export const matcher1 = (regex: RegExp): ((str: string) => Maybe<string>) =>
    matcher(regex, ([, _]) => Maybe.fromNullable(_))

  export const matcher2 = (regex: RegExp): ((str: string) => Maybe<Tuple<string, string>>) =>
    matcher(regex, ([, a, b]) =>
      apply.sequenceT(Maybe.Apply)(Maybe.fromNullable(a), Maybe.fromNullable(b)),
    )

  export const matcher3 = (
    regex: RegExp,
  ): ((str: string) => Maybe<Tuple3<string, string, string>>) =>
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

  export const pad10 = padStart(2)
  export const pad100 = padStart(3)

  export const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = pad10(date.getMonth() + 1)
    const day = pad10(date.getDate())
    const hours = pad10(date.getHours())
    const minutes = pad10(date.getMinutes())

    return `${year}/${month}/${day}, ${hours}:${minutes}`
  }

  export const prettyMs = (ms: MsDuration): string => {
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
}
