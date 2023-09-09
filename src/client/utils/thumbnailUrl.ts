import { pipe } from 'fp-ts/function'

import { StringUtils } from '../../shared/utils/StringUtils'
import { Maybe } from '../../shared/utils/fp'

import { Config } from './Config'

// | Thumbnail Suffix | Thumbnail Name   | Thumbnail Size | Keeps Image Proportions |
// | ---------------- | ---------------- | -------------- | ----------------------- |
// | s                | Small Square     | 90x90          | No                      |
// | b                | Big Square       | 160x160        | No                      |
// | t                | Small Thumbnail  | 160x160        | Yes                     |
// | m                | Medium Thumbnail | 320x320        | Yes                     |
// | l                | Large Thumbnail  | 640x640        | Yes                     |
// | h                | Huge Thumbnail   | 1024x1024      | Yes                     |

// https://bitmapcake.blogspot.com/2015/05/imgur-image-sizes-and-thumbnails.html

const urlRegex = /^(.*)(\.[a-zA-Z]+)$/

export type ThumbnailSuffix = 's' | 'b' | 't' | 'm' | 'l' | 'h'

const maxSizes: Record<ThumbnailSuffix, number> = {
  s: 90,
  b: 160,
  t: 160,
  m: 320,
  l: 640,
  h: 1024,
}

export const ThumbnailSuffix = { maxSizes }

export const imgurImgUrl = (url: string, suffix: ThumbnailSuffix): string =>
  pipe(
    url,
    StringUtils.matcher2(urlRegex),
    Maybe.map(([before, extension]) => `${before}${suffix}${extension}`),
    Maybe.getOrElse(() => url),
  )

const basenameRegex = /^.*\/([^\/]*)$/

export const cachedImgUrl = (url: string): string =>
  `${Config.imagesUrl}/${pipe(
    url,
    StringUtils.matcher1(basenameRegex),
    Maybe.getOrElse(() => url),
  )}`
