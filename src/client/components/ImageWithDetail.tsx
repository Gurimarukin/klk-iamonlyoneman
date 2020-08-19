import styled from '@emotion/styled'
import React from 'react'
import { LazyLoadImage, ScrollPosition } from 'react-lazy-load-image-component'

import { Maybe, pipe } from '../../shared/utils/fp'

import { KlkPost } from '../../shared/models/klkPost/KlkPost'
import { Size } from '../../shared/models/klkPost/Size'

import { theme } from '../utils/theme'

type Props = Readonly<{
  scrollPosition: ScrollPosition
  resizeImg: (size: Size) => Size
  post: KlkPost
}>

const PLACEHOLDER = '__placeholder'

export const ImageWithDetail = ({ scrollPosition, resizeImg, post }: Props): JSX.Element => {
  const size: Size = pipe(
    post.size,
    Maybe.fold(
      () => ({ width: theme.Gallery.smallestSide, height: theme.Gallery.smallestSide }),
      resizeImg,
    ),
  )
  return (
    <StyledContainer>
      <StyledImage
        alt={post.title}
        src={post.url}
        scrollPosition={scrollPosition}
        effect='blur'
        placeholder={<span />}
        wrapperClassName={PLACEHOLDER}
        {...size}
      />
      <StyledTitle style={{ width: size.width }}>{post.title}</StyledTitle>
    </StyledContainer>
  )
}

const StyledContainer = styled.div({
  fontFamily: 'monospace',
  color: 'white',
  margin: `${theme.Gallery.margin}px 0`,
  display: 'flex',
  flexDirection: 'column',

  [`& .${PLACEHOLDER}`]: {
    display: 'flex',
    background: 'linear-gradient(135deg, rgba(253,187,45,1) 0%, rgba(0,0,0,1) 100%)',
  },
})

const StyledImage = styled(LazyLoadImage)({
  boxShadow: '0 0 8px black',
})

const StyledTitle = styled.span({
  padding: '0.3em 0',
  fontSize: '14px',
  textShadow: '-1px -1px 4px black, 1px -1px 4px black, -1px 1px 4px black, 1px 1px 4px black',
})
