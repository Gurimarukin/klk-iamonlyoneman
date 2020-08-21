import fmt from 'dateformat'
import util from 'util'

import { Future, IO } from '../../shared/utils/fp'

import { LogLevel, LogLevelOrOff } from '../models/LogLevel'

export type Logger = Record<LogLevel, (arg: unknown, ...args: unknown[]) => IO<void>>

export type PartialLogger = (name: string) => Logger

export const PartialLogger = (configLogLevel: LogLevelOrOff): PartialLogger => name => {
  const consoleLog = (level: LogLevel, msg: string): Future<void> =>
    shouldLog(configLogLevel, level)
      ? Future.apply(
          () =>
            new Promise<void>(resolve => {
              resolve(console.log(formatConsole(name, level, msg)))
            }),
        )
      : Future.unit

  const log = (level: LogLevel, msg: string): IO<void> => IO.runFuture(consoleLog(level, msg))

  const debug = (param: unknown, ...params: unknown[]) =>
    log('debug', util.format(param, ...params))
  const info = (param: unknown, ...params: unknown[]) => log('info', util.format(param, ...params))
  const warn = (param: unknown, ...params: unknown[]) => log('warn', util.format(param, ...params))
  const error = (param: unknown, ...params: unknown[]) =>
    log('error', util.format(param, ...params))

  return { debug, info, warn, error }
}

function shouldLog(setLevel: LogLevelOrOff, level: LogLevel): boolean {
  return LogLevelOrOff.value[setLevel] >= LogLevelOrOff.value[level]
}

function formatConsole(name: string, level: LogLevel, msg: string): string {
  const withName = `${name} - ${msg}`
  const withTimestamp = `${color(fmt('yyyy/mm/dd HH:MM:ss'), '30;1')} ${withName}`
  const c = LogLevel.color[level]
  return level === 'info' || level === 'warn'
    ? `[${color(level.toUpperCase(), c)}]  ${withTimestamp}`
    : `[${color(level.toUpperCase(), c)}] ${withTimestamp}`
}

function color(s: string, c: string): string {
  return process.stdout.isTTY ? `\x1B[${c}m${s}\x1B[0m` : s
}
