import * as C from 'io-ts/lib/Codec'

import { KlkPostId } from './KlkPostId'
import { KlkPostMetadata } from './KlkPostMetadata'
import { DateFromISOString } from '../../../shared/models/DateFromISOString'
import { Maybe } from '../../../shared/utils/fp'

export namespace KlkPost {
  export const codec = C.type({
    id: KlkPostId.codec,
    title: C.string,
    createdAt: DateFromISOString.codec,
    permalink: C.string,
    url: C.string,
    metadata: Maybe.codec(KlkPostMetadata.codec),
  })
}

export type KlkPost = C.TypeOf<typeof KlkPost.codec>
