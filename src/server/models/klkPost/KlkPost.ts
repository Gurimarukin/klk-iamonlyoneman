import * as C from 'io-ts/lib/Codec'

import { KlkPostId } from './KlkPostId'
import { Link } from '../Link'
import { Size } from '../Size'
import { DateFromISOString } from '../../../shared/models/DateFromISOString'
import { Maybe, pipe, Do } from '../../../shared/utils/fp'
import { StringUtils } from '../../../shared/utils/StringUtils'

type Metadata = Readonly<{
  episode: Maybe<number>
  size: Maybe<Size>
}>

export namespace KlkPost {
  export const onlyWithIdCodec = C.type({
    id: KlkPostId.codec,
  })

  export const codec = pipe(
    onlyWithIdCodec,
    C.intersect(
      C.type({
        title: C.string,
        episode: Maybe.codec(C.number),
        size: Maybe.codec(Size.codec),
        createdAt: DateFromISOString.codec,
        permalink: C.string,
        url: C.string,
      }),
    ),
  )

  export function fromLink(l: Link): KlkPost {
    const { episode, size } = metadataFromTitle(l.data.title)
    return {
      id: l.data.id,
      title: l.data.title,
      episode,
      size,
      createdAt: new Date(l.data.created_utc * 1000),
      permalink: l.data.permalink,
      url: l.data.url,
    }
  }
}

export type KlkPost = C.TypeOf<typeof KlkPost.codec>

const Regex = {
  episode: /eps?is?ode\s+([0-9]+)/i,
  size: /([0-9]+)\s*x\s*([0-9]+)/i,
}

export function metadataFromTitle(title: string): Metadata {
  const episode = pipe(title, StringUtils.matcher1(Regex.episode), Maybe.chain(toNumber))
  const size = pipe(
    title,
    StringUtils.matcher2(Regex.size),
    Maybe.chain(([width, height]) =>
      Do(Maybe.option)
        .bindL('width', () => toNumber(width))
        .bindL('height', () => toNumber(height))
        .done(),
    ),
  )
  return { episode, size }
}

function toNumber(str: string): Maybe<number> {
  const n = Number(str.trim())
  return isNaN(n) ? Maybe.none : Maybe.some(n)
}
