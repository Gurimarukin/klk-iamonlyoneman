import { apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { Either, IO, List, Maybe, NonEmptyArray, unknownToError } from '../../shared/utils/fp'
import { s } from '../../shared/utils/StringUtils'
import { FileUtils } from '../utils/FileUtils'

export type Validated<A> = Either<string, A>
export type ValidatedNea<A> = Either<NonEmptyArray<string>, A>

export type ConfReader = {
  readonly read: <A>(
    codec: D.Decoder<unknown, A>,
  ) => (path: string, ...paths: List<string>) => ValidatedNea<A>
  readonly readOpt: <A>(
    codec: D.Decoder<unknown, A>,
  ) => (path: string, ...paths: List<string>) => ValidatedNea<Maybe<A>>
}

export namespace ConfReader {
  export function fromFiles(path: string, ...paths: List<string>): IO<ConfReader> {
    return pipe(
      parseJsonFiles(path, ...paths),
      IO.map<NonEmptyArray<unknown>, ConfReader>(jsons =>
        fromJsons(NonEmptyArray.head(jsons), ...NonEmptyArray.tail(jsons)),
      ),
    )
  }

  export function fromJsons(json: unknown, ...jsons: List<unknown>): ConfReader {
    const readOpt = <A>(codec: D.Decoder<unknown, A>) => (
      path: string,
      ...paths: List<string>
    ): ValidatedNea<Maybe<A>> => {
      const allPaths: NonEmptyArray<string> = [path, ...paths]

      const valueForPath = pipe(
        jsons,
        List.reduce(readPath(allPaths, json), (acc, json_) =>
          pipe(
            acc,
            Maybe.alt(() => readPath(allPaths, json_)),
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
            e => NonEmptyArray.of(s`key ${allPaths.join('.')}:\n${D.draw(e)}`),
            Maybe.some,
          ),
        )
      }
    }

    const read = <A>(codec: D.Decoder<unknown, A>) => (
      path: string,
      ...paths: List<string>
    ): ValidatedNea<A> =>
      pipe(
        readOpt(codec)(path, ...paths),
        Either.chain(
          Either.fromOption(() =>
            NonEmptyArray.of(s`key ${[path, ...paths].join('.')}: missing key`),
          ),
        ),
      )

    return { read, readOpt }
  }
}

function parseJsonFiles(path: string, ...paths: List<string>): IO<NonEmptyArray<unknown>> {
  return paths.reduce(
    (acc, path_) =>
      pipe(
        apply.sequenceT(IO.ioEither)(acc, loadConfigFile(path_)),
        IO.map(([acc_, newConf]) => NonEmptyArray.snoc(acc_, newConf)),
      ),
    pipe(loadConfigFile(path), IO.map(NonEmptyArray.of)),
  )
}

function loadConfigFile(path: string): IO<unknown> {
  return pipe(
    FileUtils.readFileSync(path),
    IO.chain(_ => IO.fromEither(Either.parseJSON(_, unknownToError))),
  )
}

function readPath(paths: List<string>, val: unknown): Maybe<unknown> {
  if (List.isEmpty(paths)) return Maybe.some(val)

  const [head, ...tail] = paths
  return pipe(
    Maybe.fromNullable(head),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Maybe.chain(h => Maybe.tryCatch<unknown>(() => (val as any)[h])),
    Maybe.filter(_ => _ !== undefined),
    Maybe.chain(newVal => readPath(tail, newVal)),
  )
}
