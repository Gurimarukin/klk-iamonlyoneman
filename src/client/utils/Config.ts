import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { Dict, Either, Try } from '../../shared/utils/fp'
import { decodeError } from '../../shared/utils/ioTsUtils'

type Config = D.TypeOf<typeof decoder>

const decoder = D.struct({
  apiHost: D.string,
})

// It's important to have process.env.ENV_VAR fully, as it is inlined by Parcel
const inlined: Dict<string, string | undefined> = {
  apiHost: process.env['API_HOST'],
}

const Config: Config = pipe(
  decoder.decode(inlined),
  Either.mapLeft(decodeError('Config')(inlined)),
  Try.getUnsafe,
)

export { Config }
