import styled from '@emotion/styled'
import React, { useMemo, useCallback, useEffect, useState } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'

import { pipe, Maybe } from '../shared/utils/fp'

import { KlkPosts } from '../shared/models/klkPost/KlkPost'
import { KlkPostId } from '../shared/models/klkPost/KlkPostId'
import { Size } from '../shared/models/klkPost/Size'

import { useAsyncState } from './hooks/useAsyncState'
import { AsyncState } from './models/AsyncState'
import { Config } from './utils/Config'
import { Http } from './utils/Http'
import { useMaybeRef } from './hooks/useMaybeRef'

namespace Dimensions {
  export const smallestSide = 500
  // export const margin = 6
  export const maxHeight = 0.9 // * 100vh
}

export const App = (): JSX.Element => {
  const future = useMemo(() => Http.get(`${Config.apiHost}/klk-posts`, KlkPosts.codec.decode), [])
  const [state] = useAsyncState(future)

  const [ref, mountRef] = useMaybeRef<HTMLDivElement>()

  const getMaxDimension = useCallback(
    (): [number, number] =>
      pipe(
        ref.current,
        Maybe.fold(
          () => [window.innerWidth, window.innerHeight * Dimensions.maxHeight],
          _ => [_.clientWidth, _.clientHeight * Dimensions.maxHeight],
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
        const w = widthFromHeight(size, Dimensions.smallestSide)
        return w > maxWidth
          ? { width: maxWidth, height: heightFromWidth(size, maxWidth) }
          : { width: w, height: Dimensions.smallestSide }
      }

      const h = heightFromWidth(size, Dimensions.smallestSide)
      return h > maxHeight
        ? { width: widthFromHeight(size, maxHeight), height: maxHeight }
        : { width: Dimensions.smallestSide, height: h }
    },
    [maxWidth, maxHeight],
  )

  const onSuccess = useCallback(
    (s: KlkPosts): JSX.Element => (
      <StyledContainer ref={onMount}>
        {s.map(_ => {
          const size: Partial<Size> = pipe(
            _.size,
            Maybe.fold(
              () => ({
                height: Dimensions.smallestSide,
              }),
              resizeImg,
            ),
          )
          return (
            <StyledImage
              key={KlkPostId.unwrap(_.id)}
              alt={_.title}
              effect='opacity'
              src={_.url}
              {...size}
            />
          )
        })}
      </StyledContainer>
    ),
    [onMount, resizeImg],
  )

  return pipe(
    state,
    AsyncState.fold({
      onLoading: () => <div>Loading...</div>,
      onFailure: e => <StyledPre>{e.message}</StyledPre>,
      onSuccess,
    }),
  )
}

function widthFromHeight({ width, height }: Size, newHeight: number): number {
  return (width * newHeight) / height
}

function heightFromWidth({ width, height }: Size, newWidth: number): number {
  return (height * newWidth) / width
}

const StyledContainer = styled.div({
  // margin: `0 0 ${Dimensions.margin}px ${Dimensions.margin}px`,
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  // flexDirection: 'column',
})

const StyledImage = styled(LazyLoadImage)({
  // flex: '0 0 0',
  // margin: `${Dimensions.margin}px ${Dimensions.margin}px 0 0`,
  // maxWidth: `calc(100% - ${2 * Dims.margin}px)`,
  // maxHeight: `calc(90vh - ${2 * Dims.margin}px)`,
})

const StyledPre = styled.pre({
  fontFamily: 'monospace',
  fontSize: '16px',
  color: 'white',
})
