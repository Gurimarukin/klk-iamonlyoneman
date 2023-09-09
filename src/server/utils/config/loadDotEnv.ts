import * as dotenv from 'dotenv'
import { pipe } from 'fp-ts/function'

import { Dict, IO } from '../../../shared/utils/fp'

export const loadDotEnv: IO<Partial<Dict<string, string>>> = pipe(
  IO.tryCatch(() => dotenv.config()),
  IO.chain(result =>
    result.parsed !== undefined
      ? IO.successful(process.env)
      : result.error !== undefined
      ? IO.failed(result.error)
      : IO.failed(Error('result.error was undefined')),
  ),
)
