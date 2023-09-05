import { json } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import { DecodeError } from 'io-ts/Decoder'
import { AnyNewtype, CarrierOf, iso } from 'newtype-ts'

import { StringUtils } from './StringUtils'
import { Either } from './fp'

const limit = 10000

export const decodeErrorString =
  (name: string) =>
  (value: unknown) =>
  (error: DecodeError): string =>
    StringUtils.stripMargins(
      `Couldn't decode ${name}:
      |Error:
      |${pipe(D.draw(error), StringUtils.ellipse(limit))}
      |
      |Value: ${pipe(
        json.stringify(value),
        Either.getOrElse(() => `${value}`),
        StringUtils.ellipse(limit),
      )}`,
    )

export const decodeError =
  (name: string) =>
  (value: unknown) =>
  (error: DecodeError): Error =>
    Error(decodeErrorString(name)(value)(error))

export function fromNewtype<N extends AnyNewtype = never>(
  codec: C.Codec<unknown, CarrierOf<N>, CarrierOf<N>>,
): C.Codec<unknown, CarrierOf<N>, N> {
  const i = iso<N>()
  return C.make(
    { decode: flow(codec.decode, Either.map(i.wrap)) },
    { encode: flow(i.unwrap, codec.encode) },
  )
}
