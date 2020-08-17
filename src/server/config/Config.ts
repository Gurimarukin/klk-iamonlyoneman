import { sequenceT } from 'fp-ts/lib/Apply'
import * as D from 'io-ts/lib/Decoder'

import { IO, pipe, Either, NonEmptyArray, Maybe } from '../../shared/utils/fp'

import { ConfReader, ValidatedNea } from './ConfReader'
import { LogLevelOrOff } from '../models/LogLevel'

// Config

export interface Config {
  logLevel: LogLevelOrOff
  port: number
  allowedOrigins: Maybe<NonEmptyArray<string>>
  db: DbConfig
}

export function Config(
  logLevel: LogLevelOrOff,
  port: number,
  allowedOrigins: Maybe<NonEmptyArray<string>>,
  db: DbConfig,
): Config {
  return { logLevel, port, allowedOrigins, db }
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
}

function readConfig(reader: ConfReader): ValidatedNea<Config> {
  return pipe(
    sequenceT(Either.getValidation(NonEmptyArray.getSemigroup<string>()))(
      reader.read(LogLevelOrOff.decoder)('logLevel'),
      reader.read(D.number)('port'),
      reader.readOpt(NonEmptyArray.decoder(D.string))('allowedOrigins'),
      DbConfig.read(reader),
    ),
    Either.map(([logLevel, port, allowedOrigins, db]) =>
      Config(logLevel, port, allowedOrigins, db),
    ),
  )
}

// DbConfig

interface DbConfig {
  host: string
  dbName: string
  user: string
  password: string
}

export function DbConfig(host: string, dbName: string, user: string, password: string): DbConfig {
  return { host, dbName, user, password }
}

export namespace DbConfig {
  export const read = (reader: ConfReader): ValidatedNea<DbConfig> =>
    pipe(
      sequenceT(Either.getValidation(NonEmptyArray.getSemigroup<string>()))(
        reader.read(D.string)('db', 'host'),
        reader.read(D.string)('db', 'dbName'),
        reader.read(D.string)('db', 'user'),
        reader.read(D.string)('db', 'password'),
      ),
      Either.map(([host, dbName, user, password]) => DbConfig(host, dbName, user, password)),
    )
}
