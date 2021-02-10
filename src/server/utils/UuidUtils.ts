import * as uuid from 'uuid'

import { IO } from '../../shared/utils/fp'

export namespace UuidUtils {
  export const uuidV4: IO<string> = IO.tryCatch(() => uuid.v4())
}
