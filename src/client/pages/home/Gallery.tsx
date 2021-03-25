/* eslint-disable functional/no-expression-statement, functional/no-return-void */
import styled from '@emotion/styled'
import { pipe } from 'fp-ts/function'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollPosition } from 'react-lazy-load-image-component'

import { KlkPostDAO } from '../../../shared/models/klkPost/KlkPostDAO'
import { KlkPostId } from '../../../shared/models/klkPost/KlkPostId'
import { Size } from '../../../shared/models/klkPost/Size'
import { List, Tuple } from '../../../shared/utils/fp'
import { theme } from '../../utils/theme'
import { ImageWithDetail } from './ImageWithDetail'

type Props = {
  readonly klkPosts: List<KlkPostDAO>
  readonly scrollPosition: ScrollPosition
}

export const Gallery: React.FC<Props> = ({ klkPosts, scrollPosition, children }) => {
  const [[maxWidth, maxHeight], setMaxDimensions] = useState<Tuple<number, number>>(getMaxDimension)
  const onResize = useCallback((): void => setMaxDimensions(getMaxDimension()), [])

  useEffect(() => {
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [onResize])

  const resizeImg = useCallback(
    (size: Size): Size => {
      const { width, height } = size
      if (width > height) {
        const w = widthFromHeight(size, theme.Gallery.smallestSide)
        return w > maxWidth
          ? { width: maxWidth, height: heightFromWidth(size, maxWidth) }
          : { width: w, height: theme.Gallery.smallestSide }
      }

      const w = Math.min(theme.Gallery.smallestSide, maxWidth)
      const h = heightFromWidth(size, w)
      return h > maxHeight
        ? { width: widthFromHeight(size, maxHeight), height: maxHeight }
        : { width: w, height: h }
    },
    [maxWidth, maxHeight],
  )

  return (
    <Container ref={onResize}>
      {klkPosts.map(p => (
        <ImageWithDetail
          key={KlkPostId.unwrap(p.id)}
          scrollPosition={scrollPosition}
          resizeImg={resizeImg}
          post={p}
        />
      ))}
      {children}
    </Container>
  )
}

const getMaxDimension = (): Tuple<number, number> =>
  pipe(
    Tuple.of(
      window.innerWidth - 2 * theme.Gallery.margin,
      window.innerHeight * theme.Gallery.maxHeight,
    ),
    Tuple.bimap(
      w => Math.min(w, theme.Gallery.thumbnail.maxSize),
      h => Math.min(h, theme.Gallery.thumbnail.maxSize),
    ),
  )

const widthFromHeight = ({ width, height }: Size, newHeight: number): number =>
  (width * newHeight) / height

const heightFromWidth = ({ width, height }: Size, newWidth: number): number =>
  (height * newWidth) / width

const Container = styled.div({
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  paddingTop: theme.spacing.xl,

  '&::after': {
    content: "''",
    width: '100%',
    height: theme.spacing.xl,
  },
})
