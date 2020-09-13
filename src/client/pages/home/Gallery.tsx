import styled from '@emotion/styled'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollPosition } from 'react-lazy-load-image-component'

import { KlkPostDAOs } from '../../../shared/models/klkPost/KlkPostDAO'
import { KlkPostId } from '../../../shared/models/klkPost/KlkPostId'
import { Size } from '../../../shared/models/klkPost/Size'
import { List, Maybe, pipe } from '../../../shared/utils/fp'
import { useMaybeRef } from '../../hooks/useMaybeRef'
import { theme } from '../../utils/theme'
import { ImageWithDetail } from './ImageWithDetail'

type Props = Readonly<{
  klkPosts: KlkPostDAOs
  scrollPosition: ScrollPosition
  headerRef: React.MutableRefObject<Maybe<HTMLElement>>
}>

export const Gallery: React.FC<Props> = ({ klkPosts, scrollPosition, headerRef, children }) => {
  const [ref, mountRef] = useMaybeRef<HTMLDivElement>()

  const getMaxDimension = useCallback(
    (): [number, number] =>
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

  const [[maxWidth, maxHeight], setMaxDimensions] = useState<[number, number]>(getMaxDimension)
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

      const h = heightFromWidth(size, theme.Gallery.smallestSide)
      return h > maxHeight
        ? { width: widthFromHeight(size, maxHeight), height: maxHeight }
        : { width: theme.Gallery.smallestSide, height: h }
    },
    [maxWidth, maxHeight],
  )

  return (
    <Container
      ref={onMount}
      style={
        List.isEmpty(klkPosts)
          ? {}
          : {
              height: pipe(
                headerRef.current,
                Maybe.fold(
                  () => '100%',
                  e => `calc(100% - ${e.clientHeight}px)`,
                ),
              ),
            }
      }
    >
      {klkPosts.map(_ => (
        <ImageWithDetail
          key={KlkPostId.unwrap(_.id)}
          scrollPosition={scrollPosition}
          resizeImg={resizeImg}
          post={_}
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
  paddingTop: theme.spacing.extraLarge,

  '&::after': {
    content: `''`,
    width: '100%',
    height: theme.spacing.extraLarge,
  },
})
