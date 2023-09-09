import fs from 'fs'

import { IO } from '../../shared/utils/fp'

export const FileUtils = {
  readFileSync: (path: string): IO<string> => IO.tryCatch(() => fs.readFileSync(path, 'utf8')),
}
