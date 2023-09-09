import * as uuid from 'uuid'

import { IO } from '../../shared/utils/fp'

const uuidV4: IO<string> = IO.tryCatch(() => uuid.v4())

export const UuidUtils = { uuidV4 }
