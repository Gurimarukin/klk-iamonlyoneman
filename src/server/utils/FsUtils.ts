import { pipe } from 'fp-ts/function'
import fs from 'fs'

import type { NotUsed } from '../../shared/utils/fp'
import { Future, Maybe, toNotUsed } from '../../shared/utils/fp'

import type { Dir, FileOrDir, MyFile } from '../models/FileOrDir'

const exists = (f: FileOrDir): Future<boolean> => pipe(stat(f), Future.map(Maybe.isSome))

const mkdir = (f: Dir, options?: fs.MakeDirectoryOptions): Future<NotUsed> =>
  pipe(
    Future.tryCatch(() => fs.promises.mkdir(f.path, options)),
    Future.map(toNotUsed),
  )

const readFile = (file: MyFile): Future<string> =>
  Future.tryCatch(() => fs.promises.readFile(file.path, { encoding: 'utf-8' }))

const stat = (f: FileOrDir): Future<Maybe<fs.Stats>> =>
  pipe(
    Future.tryCatch(() => fs.promises.stat(f.path)),
    Future.map(Maybe.some),
    Future.orElse(() => Future.successful<Maybe<fs.Stats>>(Maybe.none)),
  )

const writeFile =
  (file: MyFile) =>
  (data: string | Buffer): Future<NotUsed> =>
    pipe(
      Future.tryCatch(() => fs.promises.writeFile(file.path, data, { encoding: 'utf-8' })),
      Future.map(toNotUsed),
    )

export const FsUtils = {
  exists,
  mkdir,
  readFile,
  stat,
  writeFile,
}
