import styled from '@emotion/styled'
import React, { useCallback, useState, useEffect } from 'react'
import { ScrollPosition, trackWindowScroll } from 'react-lazy-load-image-component'

import { Maybe, pipe } from '../../shared/utils/fp'

import { KlkPosts } from '../../shared/models/klkPost/KlkPost'
import { KlkPostId } from '../../shared/models/klkPost/KlkPostId'
import { Size } from '../../shared/models/klkPost/Size'

import { ImageWithDetail } from './ImageWithDetail'
import { useMaybeRef } from '../hooks/useMaybeRef'
import { theme } from '../utils/theme'

type Props = Readonly<{
  klkPosts: KlkPosts
  scrollPosition: ScrollPosition
}>

export const Gallery = trackWindowScroll(
  ({ klkPosts, scrollPosition }: Props): JSX.Element => {
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
            _ => [
              _.clientWidth - 2 * theme.Gallery.margin,
              _.clientHeight * theme.Gallery.maxHeight,
            ],
          ),
        ),
      [ref],
    )

    const [[maxWidth, maxHeight], setMaxDimensions] = useState<[number, number]>(getMaxDimension)
    const updateMaxDimensions = useCallback((): void => setMaxDimensions(getMaxDimension()), [
      getMaxDimension,
    ])

    const onMount = useCallback(
      (elt: HTMLDivElement | null) => {
        mountRef(elt)
        updateMaxDimensions()
      },
      [mountRef, updateMaxDimensions],
    )

    useEffect(() => {
      window.addEventListener('resize', updateMaxDimensions)
      return () => window.removeEventListener('resize', updateMaxDimensions)
    }, [updateMaxDimensions])

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
      <StyledContainer ref={onMount}>
        {klkPosts.map(_ => (
          <ImageWithDetail
            key={KlkPostId.unwrap(_.id)}
            scrollPosition={scrollPosition}
            resizeImg={resizeImg}
            post={_}
          />
        ))}
      </StyledContainer>
    )
  },
)

function widthFromHeight({ width, height }: Size, newHeight: number): number {
  return (width * newHeight) / height
}

function heightFromWidth({ width, height }: Size, newWidth: number): number {
  return (height * newWidth) / width
}

const StyledContainer = styled.div({
  height: '100vh',
  overflow: 'auto scroll',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  background: `linear-gradient(0deg, ${theme.colors.black} 0%, ${theme.colors.darkblue} 33%, ${theme.colors.darkred} 67%, ${theme.colors.black} 100%)`,
  paddingBottom: `${theme.Gallery.margin}px`,
})

// Nonon
// 440821
// C1BD46
// F5DAE4
// ED69D0
// C52072

// Credits
// 4C82D8
// 5E62A9
// 71486E
// 9E4C65
// 030303

// Ryuko 1
// E994BC
// A32510
// 1A1D2C
// 46C196
// F4EE6F

// Ryuko 2
// DDB6AF
// 7E6572
// 303142
// B63016
// A75549
