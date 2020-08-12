import * as D from 'io-ts/lib/Decoder'

import {
  Do,
  Either,
  IO,
  List,
  Maybe,
  NonEmptyArray,
  pipe,
  unknownToError,
} from '../../shared/utils/fp'

import { FileUtils } from '../utils/FileUtils'

export type Validated<A> = Either<string, A>
export type ValidatedNea<A> = Either<NonEmptyArray<string>, A>

export interface ConfReader {
  read: <A>(codec: D.Decoder<unknown, A>) => (path: string, ...paths: string[]) => ValidatedNea<A>
  readOpt: <A>(
    codec: D.Decoder<unknown, A>,
  ) => (path: string, ...paths: string[]) => ValidatedNea<Maybe<A>>
}

export namespace ConfReader {
  export function fromFiles(path: string, ...paths: string[]): IO<ConfReader> {
    return pipe(
      parseJsonFiles(path, ...paths),
      IO.map<NonEmptyArray<unknown>, ConfReader>(jsons =>
        fromJsons(NonEmptyArray.head(jsons), ...NonEmptyArray.tail(jsons)),
      ),
    )
  }

  export function fromJsons(json: unknown, ...jsons: unknown[]): ConfReader {
    const readOpt = <A>(codec: D.Decoder<unknown, A>) => (
      path: string,
      ...paths: string[]
    ): ValidatedNea<Maybe<A>> => {
      const allPaths: NonEmptyArray<string> = [path, ...paths]

      const valueForPath = pipe(
        jsons,
        List.reduce(readPath(allPaths, json), (acc, json) =>
          pipe(
            acc,
            Maybe.alt(() => readPath(allPaths, json)),
          ),
        ),
      )

      return pipe(
        valueForPath,
        Maybe.fold(() => Either.right(Maybe.none), decodeVal),
      )

      function decodeVal(val: unknown): ValidatedNea<Maybe<A>> {
        return pipe(
          codec.decode(val),
          Either.bimap(
            e => NonEmptyArray.of(`key ${allPaths.join('.')}:\n${D.draw(e)}`),
            Maybe.some,
          ),
        )
      }
    }

    const read = <A>(codec: D.Decoder<unknown, A>) => (
      path: string,
      ...paths: string[]
    ): ValidatedNea<A> =>
      pipe(
        readOpt(codec)(path, ...paths),
        Either.chain(
          Either.fromOption(() =>
            NonEmptyArray.of(`key ${[path, ...paths].join('.')}: missing key`),
          ),
        ),
      )

    return { read, readOpt }
  }
}

function parseJsonFiles(path: string, ...paths: string[]): IO<NonEmptyArray<unknown>> {
  return paths.reduce(
    (acc, path) =>
      Do(IO.ioEither)
        .bindL('acc', () => acc)
        .bindL('newConf', () => loadConfigFile(path))
        .return(({ acc, newConf }) => NonEmptyArray.snoc(acc, newConf)),
    pipe(loadConfigFile(path), IO.map(NonEmptyArray.of)),
  )
}

function loadConfigFile(path: string): IO<unknown> {
  return pipe(
    FileUtils.readFileSync(path),
    IO.chain(_ => IO.fromEither(Either.parseJSON(_, unknownToError))),
  )
}

function readPath(paths: string[], val: unknown): Maybe<unknown> {
  if (List.isEmpty(paths)) return Maybe.some(val)

  const [head, ...tail] = paths
  return pipe(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Maybe.tryCatch(() => (val as any)[head]),
    Maybe.filter(_ => _ !== undefined),
    Maybe.chain(newVal => readPath(tail, newVal)),
  )
}
