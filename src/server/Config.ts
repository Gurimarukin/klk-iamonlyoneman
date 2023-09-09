import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { Lens as MLens } from 'monocle-ts'

import { MsDuration } from '../shared/MsDuration'
import { NumberFromString } from '../shared/models/NumberFromString'
import { Dict, Either, IO, Maybe, NonEmptyArray, Try } from '../shared/utils/fp'

import { Dir } from './models/FileOrDir'
import { ValidatedNea } from './models/ValidatedNea'
import { LogLevelOrOff } from './models/logger/LogLevel'
import { loadDotEnv } from './utils/config/loadDotEnv'
import { parseConfig } from './utils/config/parseConfig'
import { BooleanFromString, NonEmptyArrayFromString, URLFromString } from './utils/ioTsUtils'

const seqS = ValidatedNea.getSeqS<string>()

type Config = {
  logLevel: LogLevelOrOff
  isDev: boolean
  pollOnStart: boolean
  pollEveryHours: MsDuration
  port: number
  allowedOrigins: Maybe<NonEmptyArray<URL>>
  db: DbConfig
  imagesDir: Dir
}

type DbConfig = {
  host: string
  dbName: string
  user: string
  password: string
}

const parse = (dict: Partial<Dict<string, string>>): Try<Config> =>
  parseConfig(dict)(r =>
    seqS<Config>({
      logLevel: r(LogLevelOrOff.decoder)('LOG_LEVEL'),
      isDev: r(BooleanFromString.decoder)('IS_DEV'),
      pollOnStart: r(BooleanFromString.decoder)('POLL_ON_START'),
      pollEveryHours: r(MsDuration.fromStringDecoder)('POLL_EVERY_HOURS'),
      port: r(NumberFromString.decoder)('SERVER_PORT'),
      allowedOrigins: r(Maybe.decoder(NonEmptyArrayFromString.decoder(URLFromString.decoder)))(
        'ALLOWED_ORIGINS',
      ),
      db: seqS<DbConfig>({
        host: r(D.string)('DB_HOST'),
        dbName: r(D.string)('DB_DB_NAME'),
        user: r(D.string)('DB_USER'),
        password: r(D.string)('DB_PASSWORD'),
      }),

      imagesDir: pipe(
        r(D.string)('IMAGES_DIR'),
        Either.map(dirName => pipe(Dir.of(__dirname), Dir.joinDir('..', '..', dirName))),
      ),
    }),
  )

const load: IO<Config> = pipe(loadDotEnv, IO.map(parse), IO.chain(IO.fromEither))

const Lens = {
  logLevel: MLens.fromProp<Config>()('logLevel'),
}

const Config = { load, Lens }

export { Config }
