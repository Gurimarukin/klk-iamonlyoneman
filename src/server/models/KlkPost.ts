import { apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as E from 'io-ts/Encoder'
import { Lens as MLens } from 'monocle-ts'

import { DateFromISOString } from '../../shared/models/DateFromISOString'
import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Size } from '../../shared/models/klkPost/Size'
import { Maybe } from '../../shared/utils/fp'
import { StringUtils } from '../../shared/utils/StringUtils'
import { Link } from './Link'

// KlkPost

const episodeCodec = Maybe.codec(C.number)
const sizeCodec = Maybe.codec(Size.codec)
const titleCodec = C.string
const urlCodec = C.string
const activeCodec = C.boolean

export namespace KlkPost {
  export const onlyWithIdCodec = C.type({
    id: KlkPostId.codec,
  })

  export const onlyWithIdAndUrlCodec = pipe(
    onlyWithIdCodec,
    C.intersect(
      C.type({
        url: urlCodec,
      }),
    ),
  )

  export const codec = pipe(
    onlyWithIdAndUrlCodec,
    C.intersect(
      C.type({
        title: titleCodec,
        episode: episodeCodec,
        size: sizeCodec,
        createdAt: DateFromISOString.codec,
        permalink: C.string,
        active: activeCodec,
      }),
    ),
  )

  export type Output = C.OutputOf<typeof codec>

  export const fromLink = (l: Link): KlkPost => {
    const { episode, size } = metadataFromTitle(l.data.title)
    return {
      id: l.data.id,
      title: l.data.title,
      episode,
      size,
      createdAt: new Date(l.data.created_utc * 1000),
      permalink: l.data.permalink,
      url:
        l.data.post_hint === 'link'
          ? pipe(
              imgurId(l.data.url),
              Maybe.fold(
                () => l.data.url,
                id => `https://i.imgur.com/${id}.jpg`,
              ),
            )
          : l.data.url,
      active: true,
    }
  }

  export namespace Lens {
    export const size = MLens.fromPath<KlkPost>()(['size'])
  }
}

export type KlkPost = C.TypeOf<typeof KlkPost.codec>

export type OnlyWithIdAndUrlKlkPost = C.TypeOf<typeof KlkPost.onlyWithIdAndUrlCodec>

type Metadata = {
  readonly episode: Maybe<number>
  readonly size: Maybe<Size>
}

const Regex = {
  episode: /eps?is?ode\s+([0-9]+)/i,
  size: /([0-9]+)\s*[x\*]\s*([0-9]+)/i,
  imgur: /https:\/\/imgur\.com\/([a-zA-Z0-9]+)\/?/,
}

export function metadataFromTitle(title: string): Metadata {
  const episode = pipe(title, StringUtils.matcher1(Regex.episode), Maybe.chain(toNumber))
  const size = pipe(
    title,
    StringUtils.matcher2(Regex.size),
    Maybe.chain(([width, height]) =>
      apply.sequenceS(Maybe.option)({ width: toNumber(width), height: toNumber(height) }),
    ),
  )
  return { episode, size }
}

function toNumber(str: string): Maybe<number> {
  const n = Number(str.trim())
  return isNaN(n) ? Maybe.none : Maybe.some(n)
}

export function imgurId(url: string): Maybe<string> {
  return StringUtils.matcher1(Regex.imgur)(url)
}

// KlkPosts

export namespace KlkPosts {
  export const codec = C.array(KlkPost.codec)
}

export type KlkPosts = C.TypeOf<typeof KlkPosts.codec>

// KlkPostEditPayload

type Out = {
  readonly [K in keyof KlkPostEditPayload]: KlkPost.Output[K]
}

export const klkPostEditPayloadEncoder: E.Encoder<Out, KlkPostEditPayload> = {
  encode: ({ episode, size, title, url, active }) => ({
    episode: episodeCodec.encode(episode),
    size: sizeCodec.encode(size),
    title: titleCodec.encode(title),
    url: urlCodec.encode(url),
    active: activeCodec.encode(active),
  }),
}
