import fs from 'fs'

import { IO } from '../../shared/utils/fp'

export namespace FileUtils {
  export const readFileSync = (path: string): IO<string> =>
    IO.tryCatch(() => fs.readFileSync(path, 'utf8'))
}
