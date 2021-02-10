import util from 'util'

import fmt from 'dateformat'

import { Future, IO, List } from '../../shared/utils/fp'
import { s } from '../../shared/utils/StringUtils'
import { LogLevel, LogLevelOrOff } from '../models/LogLevel'

export type Logger = Record<LogLevel, (arg: unknown, ...args: List<unknown>) => IO<void>>

export type PartialLogger = (name: string) => Logger

export const PartialLogger = (configLogLevel: LogLevelOrOff): PartialLogger => name => {
  const consoleLog = (level: LogLevel, msg: string): Future<void> =>
    shouldLog(configLogLevel, level)
      ? Future.tryCatch(
          () => new Promise<void>(resolve => resolve(console.log(formatConsole(name, level, msg)))),
        )
      : Future.unit

  const log = (level: LogLevel, msg: string): IO<void> => IO.runFuture(consoleLog(level, msg))

  const debug = (param: unknown, ...params: List<unknown>): IO<void> =>
    log('debug', util.format(param, ...params))
  const info = (param: unknown, ...params: List<unknown>): IO<void> =>
    log('info', util.format(param, ...params))
  const warn = (param: unknown, ...params: List<unknown>): IO<void> =>
    log('warn', util.format(param, ...params))
  const error = (param: unknown, ...params: List<unknown>): IO<void> =>
    log('error', util.format(param, ...params))

  return { debug, info, warn, error }
}

function shouldLog(setLevel: LogLevelOrOff, level: LogLevel): boolean {
  return LogLevelOrOff.value[setLevel] >= LogLevelOrOff.value[level]
}

function formatConsole(name: string, level: LogLevel, msg: string): string {
  const withName = s`${name} - ${msg}`
  const withTimestamp = s`${color(fmt('yyyy/mm/dd HH:MM:ss'), '30;1')} ${withName}`
  const c = LogLevel.color[level]
  return level === 'info' || level === 'warn'
    ? s`[${color(level.toUpperCase(), c)}]  ${withTimestamp}`
    : s`[${color(level.toUpperCase(), c)}] ${withTimestamp}`
}

function color(str: string, c: string): string {
  return process.stdout.isTTY ? s`\x1B[${c}m${str}\x1B[0m` : str
}
