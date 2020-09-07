import * as D from 'io-ts/Decoder'

// LogLevel

export namespace LogLevel {
  export const decoder = D.union(
    D.literal('debug'),
    D.literal('info'),
    D.literal('warn'),
    D.literal('error'),
  )

  export const color: Record<LogLevel, string> = {
    debug: '90',
    info: '36',
    warn: '33',
    error: '31;1',
  }
}

export type LogLevel = D.TypeOf<typeof LogLevel.decoder>

// LogLevelOrOff

export namespace LogLevelOrOff {
  export const decoder = D.union(LogLevel.decoder, D.literal('off'))

  export const value: Record<LogLevelOrOff, number> = {
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    off: 0,
  }
}

export type LogLevelOrOff = D.TypeOf<typeof LogLevelOrOff.decoder>
