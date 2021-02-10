/* eslint-disable functional/no-expression-statement, functional/no-return-void */
import styled from '@emotion/styled'
import { pipe } from 'fp-ts/function'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollPosition } from 'react-lazy-load-image-component'

import { KlkPostDAO } from '../../../shared/models/klkPost/KlkPostDAO'
import { KlkPostId } from '../../../shared/models/klkPost/KlkPostId'
import { Size } from '../../../shared/models/klkPost/Size'
import { List, Maybe, Tuple } from '../../../shared/utils/fp'
import { useMaybeRef } from '../../hooks/useMaybeRef'
import { theme } from '../../utils/theme'
import { ImageWithDetail } from './ImageWithDetail'

type Props = {
  readonly klkPosts: List<KlkPostDAO>
  readonly scrollPosition: ScrollPosition
}

export const Gallery: React.FC<Props> = ({ klkPosts, scrollPosition, children }) => {
  const [ref, mountRef] = useMaybeRef<HTMLDivElement>()

  const getMaxDimension = useCallback(
    (): Tuple<number, number> =>
      pipe(
        ref.current,
        Maybe.fold(
          () => [
            window.innerWidth - 2 * theme.Gallery.margin,
            window.innerHeight * theme.Gallery.maxHeight,
          ],
          _ => [_.clientWidth - 2 * theme.Gallery.margin, _.clientHeight * theme.Gallery.maxHeight],
        ),
      ),
    [ref],
  )

  const [[maxWidth, maxHeight], setMaxDimensions] = useState<Tuple<number, number>>(getMaxDimension)
  const onResize = useCallback((): void => setMaxDimensions(getMaxDimension()), [getMaxDimension])

  const onMount = useCallback(
    (elt: HTMLDivElement | null) => {
      mountRef(elt)
      onResize()
    },
    [mountRef, onResize],
  )

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
    <Container ref={onMount}>
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

function widthFromHeight({ width, height }: Size, newHeight: number): number {
  return (width * newHeight) / height
}

function heightFromWidth({ width, height }: Size, newWidth: number): number {
  return (height * newWidth) / width
}

const Container = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  paddingTop: theme.spacing.xl,
  height: '100%',

  '&::after': {
    content: "''",
    width: '100%',
    height: theme.spacing.xl,
  },
})
