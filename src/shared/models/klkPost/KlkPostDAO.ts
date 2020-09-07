import * as C from 'io-ts/Codec'

import { Maybe } from '../../utils/fp'
import { DateFromISOString } from '../DateFromISOString'
import { KlkPostId } from './KlkPostId'
import { Size } from './Size'

// KlkPostDAO

export namespace KlkPostDAO {
  export const codec = C.type({
    id: KlkPostId.codec,
    url: C.string,
    title: C.string,
    episode: Maybe.codec(C.number),
    size: Maybe.codec(Size.codec),
    createdAt: DateFromISOString.codec,
    permalink: C.string,
    active: C.boolean,
  })
}

export type KlkPostDAO = C.TypeOf<typeof KlkPostDAO.codec>

// KlkPostDAOs

export namespace KlkPostDAOs {
  export const codec = C.array(KlkPostDAO.codec)
}

export type KlkPostDAOs = C.TypeOf<typeof KlkPostDAOs.codec>
