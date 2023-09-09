import { apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as E from 'io-ts/Encoder'
import { lens } from 'monocle-ts'

import { DateFromISOString } from '../../shared/models/DateFromISOString'
import { KlkPostEditPayload } from '../../shared/models/klkPost/KlkPostEditPayload'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Size } from '../../shared/models/klkPost/Size'
import { StringUtils } from '../../shared/utils/StringUtils'
import { Maybe } from '../../shared/utils/fp'

import { Link } from './Link'

type KlkPost = C.TypeOf<typeof codec>
type KlkPostOutput = C.OutputOf<typeof codec>

const episodeCodec = Maybe.codec(C.number)
const sizeCodec = Maybe.codec(Size.codec)
const titleCodec = C.string
const urlCodec = C.string
const activeCodec = C.boolean
const noLongerAvailableCodec = Maybe.codec(C.boolean) // none: imgur hasn't been probed

const onlyWithIdCodec = C.struct({
  id: KlkPostId.codec,
})

const onlyWithIdAndUrlCodec = pipe(
  onlyWithIdCodec,
  C.intersect(
    C.struct({
      url: urlCodec,
    }),
  ),
)

const codec = pipe(
  onlyWithIdAndUrlCodec,
  C.intersect(
    C.struct({
      title: titleCodec,
      episode: episodeCodec,
      size: sizeCodec,
      createdAt: DateFromISOString.codec,
      permalink: C.string,
      active: activeCodec,
      noLongerAvailable: noLongerAvailableCodec,
    }),
  ),
)

const fromLink = (l: Link): KlkPost => {
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
    noLongerAvailable: Maybe.none,
  }
}

const KlkPost = {
  codec,
  onlyWithIdAndUrlCodec,
  fromLink,
  Lens: {
    size: pipe(lens.id<KlkPost>(), lens.prop('size')),
    noLongerAvailable: pipe(lens.id<KlkPost>(), lens.prop('noLongerAvailable')),
  },
}

type OnlyWithIdAndUrlKlkPost = C.TypeOf<typeof onlyWithIdAndUrlCodec>

export { KlkPost, KlkPostOutput, OnlyWithIdAndUrlKlkPost }

type Metadata = {
  episode: Maybe<number>
  size: Maybe<Size>
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

type KlkPosts = C.TypeOf<typeof klkPostsCodec>

const klkPostsCodec = C.array(KlkPost.codec)

const KlkPosts = { codec: klkPostsCodec }

export { KlkPosts }

// KlkPostEditPayload

type Out = {
  [K in keyof KlkPostEditPayload]: KlkPostOutput[K]
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
