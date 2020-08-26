import styled from '@emotion/styled'
import React from 'react'
import { LazyLoadImage, ScrollPosition } from 'react-lazy-load-image-component'

import { KlkPost } from '../../../shared/models/klkPost/KlkPost'
import { Size } from '../../../shared/models/klkPost/Size'
import { Maybe, pipe } from '../../../shared/utils/fp'
import { theme } from '../../utils/theme'

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
        {post.title}
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

const imgBorderRadius = '4px'

const Container = styled.div({
  flexShrink: 0,
  margin: `${theme.Gallery.margin}px 0`,
  display: 'flex',
  flexDirection: 'column',

  [`& .${PLACEHOLDER}`]: {
    display: 'flex',
    background: 'linear-gradient(135deg, rgba(253,187,45,1) 0%, rgba(0,0,0,1) 100%)',
    boxShadow: '0 0 8px black',
    overflow: 'hidden',
    borderRadius: imgBorderRadius,
  },
})

const StyledImage = styled(LazyLoadImage)({})

const TitleContainer = styled.span({
  padding: '0.3em 0',
  textShadow: '-1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black, 1px 1px 1px black',
  position: 'relative',

  [`& .${DETAIL}`]: {
    position: 'absolute',
    bottom: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '0.67em 0.67em 0.33em',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    textShadow: '1px 1px 0 black',
    overflow: 'hidden',
    borderRadius: `0 0 ${imgBorderRadius} ${imgBorderRadius}`,
    opacity: 0,
    filter: 'blur(10px)',
    transition: 'all 0.3s',
  },

  [`&:hover .${DETAIL}`]: {
    opacity: 1,
    filter: 'blur(0)',
  },
})

const Links = styled.nav({
  marginTop: '0.33em',
})

const StyledA = styled.a({
  display: 'inline-block',
  color: 'inherit',
  padding: '0.4em 0.3em',
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
