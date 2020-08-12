import fs from 'fs'

import { IO } from '../../shared/utils/fp'

export namespace FileUtils {
  export const readFileSync = (path: string): IO<string> =>
    IO.apply(() => fs.readFileSync(path, 'utf8'))
}
