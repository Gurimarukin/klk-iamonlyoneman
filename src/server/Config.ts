import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { Lens as MLens } from 'monocle-ts'

import { MsDuration } from '../shared/MsDuration'
import { NumberFromString } from '../shared/models/NumberFromString'
import { Dict, IO, Maybe, NonEmptyArray, Try } from '../shared/utils/fp'

import { LogLevelOrOff } from './models/LogLevel'
import { ValidatedNea } from './models/ValidatedNea'
import { loadDotEnv } from './utils/config/loadDotEnv'
import { parseConfig } from './utils/config/parseConfig'
import { BooleanFromString, NonEmptyArrayFromString, URLFromString } from './utils/ioTsUtils'

const seqS = ValidatedNea.getSeqS<string>()

export type Config = {
  readonly logLevel: LogLevelOrOff
  readonly isDev: boolean
  readonly pollOnStart: boolean
  readonly pollEveryHours: MsDuration
  readonly port: number
  readonly allowedOrigins: Maybe<NonEmptyArray<URL>>
  readonly db: DbConfig
}

type DbConfig = {
  readonly host: string
  readonly dbName: string
  readonly user: string
  readonly password: string
}

export namespace Config {
  const parse = (dict: Partial<Dict<string, string>>): Try<Config> =>
    parseConfig(dict)(r =>
      seqS<Config>({
        logLevel: r(LogLevelOrOff.decoder)('LOG_LEVEL'),
        isDev: r(BooleanFromString.decoder)('IS_DEV'),
        pollOnStart: r(BooleanFromString.decoder)('POLL_ON_START'),
        pollEveryHours: r(MsDuration.fromStringDecoder)('POLL_EVERY_HOURS'),
        port: r(NumberFromString.decoder)('PORT'),
        allowedOrigins: r(Maybe.decoder(NonEmptyArrayFromString.decoder(URLFromString.decoder)))(
          'ALLOWED_ORIGINS',
        ),
        db: seqS<DbConfig>({
          host: r(D.string)('DB_HOST'),
          dbName: r(D.string)('DB_DB_NAME'),
          user: r(D.string)('DB_USER'),
          password: r(D.string)('DB_PASSWORD'),
        }),
      }),
    )

  export const load: IO<Config> = pipe(loadDotEnv, IO.map(parse), IO.chain(IO.fromEither))

  export namespace Lens {
    export const logLevel = MLens.fromProp<Config>()('logLevel')
  }
}
