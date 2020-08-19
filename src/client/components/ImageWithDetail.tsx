import styled from '@emotion/styled'
import React from 'react'
import { LazyLoadImage, ScrollPosition } from 'react-lazy-load-image-component'

import { Maybe, pipe } from '../../shared/utils/fp'

import { KlkPost } from '../../shared/models/klkPost/KlkPost'
import { Size } from '../../shared/models/klkPost/Size'

import { Question } from './svgs'
import { theme } from '../utils/theme'

type Props = Readonly<{
  scrollPosition: ScrollPosition
  resizeImg: (size: Size) => Size
  post: KlkPost
}>

const PLACEHOLDER = 'placeholder'
const DETAIL = 'detail'

export const ImageWithDetail = ({ scrollPosition, resizeImg, post }: Props): JSX.Element => {
  const size: Partial<Size> = pipe(
    post.size,
    Maybe.fold(() => ({ height: theme.Gallery.smallestSide }), resizeImg),
  )
  return (
    <Container>
      <StyledImage
        alt={post.title}
        src={post.url}
        scrollPosition={scrollPosition}
        effect='blur'
        placeholder={<span />}
        wrapperClassName={PLACEHOLDER}
        {...size}
      />
      <TitleContainer style={{ width: size.width }}>
        <StyledQuestion /> {post.title}
        <div className={DETAIL}>
          <span>{post.createdAt.toLocaleString()}</span>
          <Links>
            <StyledABlue href={post.url} target='_blank'>
              View image
            </StyledABlue>
            •
            <StyledARed href={`https://reddit.com${post.permalink}`} target='_blank'>
              Reddit post
            </StyledARed>
          </Links>
        </div>
      </TitleContainer>
    </Container>
  )
}

const Container = styled.div({
  flexShrink: 0,
  fontFamily: 'monospace',
  color: 'white',
  fontSize: '14px',
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

const TitleContainer = styled.span({
  padding: '0.3em 0',
  textShadow: '-1px -1px 4px black, 1px -1px 4px black, -1px 1px 4px black, 1px 1px 4px black',
  position: 'relative',

  [`& .${DETAIL}`]: {
    position: 'absolute',
    bottom: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '0.67em',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    textShadow: '2px 2px 0 black',
    opacity: 0,
    filter: 'blur(10px)',
    visibility: 'hidden',
    transition: 'all 0.3s',
  },

  [`&:hover .${DETAIL}`]: {
    opacity: 1,
    filter: 'blur(0)',
    visibility: 'visible',
  },
})

const StyledQuestion = styled(Question)({
  verticalAlign: 'sub',
  marginRight: '0.33em',
  filter: 'drop-shadow(2px 2px 4px black) drop-shadow(-2px -2px 4px black)',
})

const Links = styled.nav({
  marginTop: '0.67em',
})

const StyledA = styled.a({
  color: 'inherit',
  padding: '0.3em',
  margin: '0 0.3em',
  borderRadius: '2px',
  transition: 'all 0.3s',
})

const StyledABlue = styled(StyledA)({
  '&:hover': {
    backgroundColor: theme.colors.darkblue,
  },
})

const StyledARed = styled(StyledA)({
  '&:hover': {
    backgroundColor: theme.colors.darkred,
  },
})
