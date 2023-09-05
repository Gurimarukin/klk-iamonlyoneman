import * as rxjsStream from 'rxjs-stream'
import type { Readable } from 'stream'

import { TObservable } from '../models/rx/TObservable'

export const TObservableUtils = {
  observableFromReadable: (stream: Readable): TObservable<unknown> => rxjsStream.streamToRx(stream),
}
