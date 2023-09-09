import fmt from 'dateformat'
import { date } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'

import type { NotUsed } from '../../../shared/utils/fp'
import { IO, toNotUsed } from '../../../shared/utils/fp'

import { utilFormat } from '../../utils/utilInspect'
import { LogLevel, LogLevelOrOff } from './LogLevel'
import { LoggerType } from './LoggerType'

type LoggerGetter = (name: string) => LoggerType

const LoggerGetter = (logLevel: LogLevelOrOff): LoggerGetter => {
  return name => ({
    trace: (...params) => log(name, 'trace', utilFormat(...params)),
    debug: (...params) => log(name, 'debug', utilFormat(...params)),
    info: (...params) => log(name, 'info', utilFormat(...params)),
    warn: (...params) => log(name, 'warn', utilFormat(...params)),
    error: (...params) => log(name, 'error', utilFormat(...params)),
  })

  function log(name: string, level: LogLevel, message: string): IO<NotUsed> {
    return LogLevelOrOff.value[level] <= LogLevelOrOff.value[logLevel]
      ? pipe(
          date.now,
          IO.fromIO,
          IO.map(
            flow(n => new Date(n), consoleLogFormat(name, level, message), console.log, toNotUsed),
          ),
        )
      : IO.notUsed
  }
}

export { LoggerGetter }

export const consoleLogFormat =
  (name: string, level: LogLevel, msg: string) =>
  (now: Date): string => {
    const withName = `${name} - ${msg}`
    const withTimestamp = `${color(formatDate(now), '30;1')} ${withName}`
    const c = LogLevel.color[level]
    return level === 'info' || level === 'warn'
      ? `${color(level.toUpperCase(), c)}  ${withTimestamp}`
      : `${color(level.toUpperCase(), c)} ${withTimestamp}`
  }

const color = (s: string, c: string): string => (process.stdout.isTTY ? `\x1B[${c}m${s}\x1B[0m` : s)

const formatDate = (d: Date): string => fmt(d, 'yyyy/mm/dd HH:MM:ss')
