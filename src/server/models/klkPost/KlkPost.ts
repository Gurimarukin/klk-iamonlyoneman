import * as C from 'io-ts/lib/Codec'

import { KlkPostId } from './KlkPostId'
import { Link } from '../Link'
import { Size } from '../Size'
import { DateFromISOString } from '../../../shared/models/DateFromISOString'
import { Maybe, pipe, Do } from '../../../shared/utils/fp'
import { StringUtils } from '../../../shared/utils/StringUtils'

type Metadata = Readonly<{
  title: string
  episode: Maybe<number>
  size: Maybe<Size>
}>

export namespace KlkPost {
  export const codec = C.type({
    id: KlkPostId.codec,
    title: C.string,
    episode: Maybe.codec(C.number),
    size: Maybe.codec(Size.codec),
    originalTitle: C.string,
    createdAt: DateFromISOString.codec,
    permalink: C.string,
    url: C.string,
  })

  export function fromLink(l: Link): KlkPost {
    const {title, episode, size} = metadataFromTitle(l.data.title)
    return {
      id: l.data.id,
      title: ,
      episode: ,
      size: ,
      originalTitle: l.data.title,
      createdAt: new Date(l.data.created_utc * 1000),
      permalink: l.data.permalink,
      url: l.data.url,
    }
  }
}

export type KlkPost = C.TypeOf<typeof KlkPost.codec>

// Ryuko is not happy (from Episode 19) [1920x2283]

const episode = /episode\s+([0-9]+)/i
const size = /\[([0-9]+)x([0-9]+)\]/

function metadataFromTitle(title: string): Metadata {


  const res =  Do(Maybe.option)
    .bindL('episode', () => pipe(title, StringUtils.matcher1(episode), Maybe.chain(toNumber)))
    .bindL('size', () =>
      pipe(
        title,
        StringUtils.matcher2(size),
        Maybe.chain(([width, height]) =>
          Do(Maybe.option)
            .bindL('width', () => toNumber(width))
            .bindL('height', () => toNumber(height))
            .done(),
        ),
      ),
    )
    .return(({ episode, size: { width, height } }) => ({ episode, width, height }))
}

function toNumber(str: string): Maybe<number> {
  const n = Number(str)
  return isNaN(n) ? Maybe.none : Maybe.some(n)
}
