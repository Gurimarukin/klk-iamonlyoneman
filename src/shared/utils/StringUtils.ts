import { apply } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'

import { List, Maybe, Tuple, Tuple3 } from './fp'

const margin = /^[^\n\S]*\|/gm

export namespace StringUtils {
  export const isEmpty = (str: string): boolean => str === ''

  export const isString = (u: unknown): u is string => typeof u === 'string'

  export const stripMargins = (str: string): string => str.replace(margin, '')

  export function mkString(sep: string): (list: List<string>) => string
  export function mkString(start: string, sep: string, end: string): (list: List<string>) => string
  export function mkString(
    startOrSep: string,
    sep?: string,
    end?: string,
  ): (list: List<string>) => string {
    return list =>
      sep !== undefined && end !== undefined
        ? `${startOrSep}${list.join(sep)}${end}`
        : list.join(startOrSep)
  }

  export const ellipse = (take: number) => (str: string): string =>
    str.length > take ? `${str.substring(0, take)}...` : str

  const matcher = <A>(regex: RegExp, f: (arr: RegExpMatchArray) => Maybe<A>) => (
    str: string,
  ): Maybe<A> => pipe(str.match(regex), Maybe.fromNullable, Maybe.chain(f))

  export const matches = (regex: RegExp): ((str: string) => boolean) =>
    flow(matcher(regex, Maybe.some), Maybe.isSome)

  export const matcher1 = (regex: RegExp): ((str: string) => Maybe<string>) =>
    matcher(regex, ([, _]) => Maybe.fromNullable(_))

  export const matcher2 = (regex: RegExp): ((str: string) => Maybe<Tuple<string, string>>) =>
    matcher(regex, ([, a, b]) =>
      apply.sequenceT(Maybe.option)(Maybe.fromNullable(a), Maybe.fromNullable(b)),
    )

  export const matcher3 = (
    regex: RegExp,
  ): ((str: string) => Maybe<Tuple3<string, string, string>>) =>
    matcher(regex, ([, a, b, c]) =>
      apply.sequenceT(Maybe.option)(
        Maybe.fromNullable(a),
        Maybe.fromNullable(b),
        Maybe.fromNullable(c),
      ),
    )

  export const pad10 = (n: number): string => (n < 10 ? `0${n}` : `${n}`)
}
