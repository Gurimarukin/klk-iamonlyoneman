import { apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { Lens as MLens } from 'monocle-ts'

import { Either, IO, Maybe, NonEmptyArray } from '../../shared/utils/fp'
import { LogLevelOrOff } from '../models/LogLevel'
import { MsDuration } from '../models/MsDuration'
import { ConfReader, ValidatedNea } from './ConfReader'

// Config

export type Config = {
  readonly logLevel: LogLevelOrOff
  readonly isDev: boolean
  readonly pollOnStart: boolean
  readonly pollEveryHours: MsDuration
  readonly port: number
  readonly allowedOrigins: Maybe<NonEmptyArray<string>>
  readonly db: DbConfig
}

export function Config(
  logLevel: LogLevelOrOff,
  isDev: boolean,
  pollOnStart: boolean,
  pollEveryHours: MsDuration,
  port: number,
  allowedOrigins: Maybe<NonEmptyArray<string>>,
  db: DbConfig,
): Config {
  return { logLevel, isDev, pollOnStart, pollEveryHours, port, allowedOrigins, db }
}

export namespace Config {
  export function load(): IO<Config> {
    return pipe(
      ConfReader.fromFiles('./conf/server/local.conf.json', './conf/server/application.conf.json'),
      IO.chain(reader =>
        pipe(
          readConfig(reader),
          Either.mapLeft(errors => new Error(`Errors while reading config:\n${errors.join('\n')}`)),
          IO.fromEither,
        ),
      ),
    )
  }

  export namespace Lens {
    export const logLevel = MLens.fromProp<Config>()('logLevel')
  }
}

function readConfig(reader: ConfReader): ValidatedNea<Config> {
  return pipe(
    apply.sequenceT(Either.getValidation(NonEmptyArray.getSemigroup<string>()))(
      reader.read(LogLevelOrOff.decoder)('logLevel'),
      reader.read(D.boolean)('isDev'),
      reader.read(D.boolean)('pollOnStart'),
      reader.read(D.number)('pollEveryHours'),
      reader.read(D.number)('port'),
      reader.readOpt(NonEmptyArray.decoder(D.string))('allowedOrigins'),
      DbConfig.read(reader),
    ),
    Either.map(([logLevel, isDev, pollOnStart, pollEveryHours, port, allowedOrigins, db]) =>
      Config(
        logLevel,
        isDev,
        pollOnStart,
        MsDuration.hours(pollEveryHours),
        port,
        allowedOrigins,
        db,
      ),
    ),
  )
}

// DbConfig

type DbConfig = {
  readonly host: string
  readonly dbName: string
  readonly user: string
  readonly password: string
}

export function DbConfig(host: string, dbName: string, user: string, password: string): DbConfig {
  return { host, dbName, user, password }
}

export namespace DbConfig {
  export const read = (reader: ConfReader): ValidatedNea<DbConfig> =>
    pipe(
      apply.sequenceT(Either.getValidation(NonEmptyArray.getSemigroup<string>()))(
        reader.read(D.string)('db', 'host'),
        reader.read(D.string)('db', 'dbName'),
        reader.read(D.string)('db', 'user'),
        reader.read(D.string)('db', 'password'),
      ),
      Either.map(([host, dbName, user, password]) => DbConfig(host, dbName, user, password)),
    )
}
