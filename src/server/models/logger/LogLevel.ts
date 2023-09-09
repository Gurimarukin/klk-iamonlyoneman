import * as D from 'io-ts/Decoder'

// LogLevel*

type LogLevel = D.TypeOf<typeof decoder>

const decoder = D.union(
  D.literal('trace'),
  D.literal('debug'),
  D.literal('info'),
  D.literal('warn'),
  D.literal('error'),
)

const color: Record<LogLevel, string> = {
  trace: '90',
  debug: '90',
  info: '36',
  warn: '33',
  error: '31;1',
}

const LogLevel = { decoder, color }

// LogLevelOrOff

type LogLevelOrOff = D.TypeOf<typeof logLevelOrOffDecoder>

const logLevelOrOffDecoder = D.union(LogLevel.decoder, D.literal('off'))

const logLevelOrOffValue: Record<LogLevelOrOff, number> = {
  trace: 5,
  debug: 4,
  info: 3,
  warn: 2,
  error: 1,
  off: 0,
}

const LogLevelOrOff = { decoder: logLevelOrOffDecoder, value: logLevelOrOffValue }

export { LogLevel, LogLevelOrOff }
