import styled from '@emotion/styled'
import React from 'react'
import { LazyLoadImage, ScrollPosition } from 'react-lazy-load-image-component'

import { Maybe, pipe } from '../../shared/utils/fp'

import { KlkPost } from '../../shared/models/klkPost/KlkPost'
import { Size } from '../../shared/models/klkPost/Size'

type Props = Readonly<{
  key?: string | number
  smallestSide: number
  scrollPosition: ScrollPosition
  resizeImg: (size: Size) => Size
  post: KlkPost
  // WARNING: className isn't passed to container but to placeholder span
  className?: string
}>

export const ImageWithDetail = ({
  key,
  smallestSide,
  scrollPosition,
  resizeImg,
  post,
  className,
}: Props): JSX.Element => {
  const size: Size = pipe(
    post.size,
    Maybe.fold(() => ({ width: smallestSide, height: smallestSide }), resizeImg),
  )
  return (
    <StyledImage
      key={key}
      alt={post.title}
      src={post.url}
      scrollPosition={scrollPosition}
      effect='opacity'
      placeholder={<span />}
      wrapperProps={{ className }}
      {...size}
    />
  )
}

const StyledImage = styled(LazyLoadImage)({
  boxShadow: '0 0 8px black',
})
