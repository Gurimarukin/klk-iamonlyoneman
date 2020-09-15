import styled from '@emotion/styled'
import React, { useCallback, useState } from 'react'
import { LazyLoadImage, ScrollPosition } from 'react-lazy-load-image-component'

import { KlkPostDAO } from '../../../shared/models/klkPost/KlkPostDAO'
import { Size } from '../../../shared/models/klkPost/Size'
import { Maybe, pipe } from '../../../shared/utils/fp'
import { StringUtils } from '../../../shared/utils/StringUtils'
import { ABlank } from '../../components/ABlank'
import { ClickOutside } from '../../components/ClickOutside'
import { Pencil } from '../../components/svgs'
import { useUser } from '../../contexts/UserContext'
import { theme } from '../../utils/theme'
import { PostEditForm } from './PostEditForm'

type Props = Readonly<{
  scrollPosition: ScrollPosition
  resizeImg: (size: Size) => Size
  post: KlkPostDAO
}>

const PLACEHOLDER = 'placeholder'
const DETAIL = 'detail'
const EDIT_BTN = 'editBtn'
const EDITING = 'editing'

export const ImageWithDetail = ({ scrollPosition, resizeImg, post }: Props): JSX.Element => {
  const size: Partial<Size> = pipe(
    post.size,
    Maybe.fold(() => ({ height: theme.Gallery.smallestSide }), resizeImg),
  )

  const { token } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = useCallback(() => setIsEditing(e => !e), [])
  const closeEditing = useCallback(() => setIsEditing(false), [])

  const permalink = `https://reddit.com${post.permalink}`

  return (
    <ClickOutside onClickOutside={closeEditing}>
      <Container className={isEditing ? EDITING : undefined}>
        <ABlank href={post.url}>
          <StyledImage
            alt={post.title}
            src={post.url}
            scrollPosition={scrollPosition}
            effect='blur'
            wrapperClassName={PLACEHOLDER}
            {...size}
          />
        </ABlank>
        <TitleContainer style={{ width: size.width }}>
          <TitleABlank href={permalink}>{post.title}</TitleABlank>
          <div className={DETAIL}>
            <span>{formatDate(post.createdAt)}</span>
            <Links>
              <ABlankBlue href={post.url}>View image</ABlankBlue>•
              <ABlankRed href={permalink}>Reddit post</ABlankRed>
            </Links>
          </div>
        </TitleContainer>
        {pipe(
          token,
          Maybe.fold(
            () => null,
            t => (
              <>
                <EditButton onClick={toggleEditing} className={EDIT_BTN}>
                  <Pencil />
                </EditButton>
                <StyledForm token={t} post={post}>
                  form
                </StyledForm>
              </>
            ),
          ),
        )}
      </Container>
    </ClickOutside>
  )
}

const pad10 = StringUtils.pad10
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = pad10(date.getMonth() + 1)
  const day = pad10(date.getDate())
  const hours = pad10(date.getHours())
  const minutes = pad10(date.getMinutes())
  return `${year}/${month}/${day}, ${hours}:${minutes}`
}

const imgBorderRadius = '4px'

const Container = styled.div({
  flexShrink: 0,
  margin: `${theme.Gallery.margin}px`,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',

  [`& .${PLACEHOLDER}`]: {
    display: 'flex',
    background: 'linear-gradient(135deg, rgba(253,187,45,1) 0%, rgba(0,0,0,1) 100%)',
    boxShadow: theme.boxShadow,
    overflow: 'hidden',
    borderRadius: imgBorderRadius,
  },

  [`& > .${EDIT_BTN}, & > form`]: {
    opacity: 0,
    visibility: 'hidden',
  },

  [`&:hover > .${EDIT_BTN}, &.${EDITING} > .${EDIT_BTN}, &.${EDITING} > form`]: {
    opacity: 1,
    visibility: 'visible',
  },

  [`& .${DETAIL}`]: {
    position: 'absolute',
    bottom: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '0.67em 0.67em 0.33em',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    textShadow: theme.textShadow(theme.colors.black),
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

const StyledImage = styled(LazyLoadImage)({})

const TitleContainer = styled.span({
  padding: '0.3em 0',
  textShadow: theme.textOutline,
  position: 'relative',
})

const TitleABlank = styled(ABlank)({
  color: 'inherit',
})

const Links = styled.nav({
  marginTop: '0.33em',
})

const StyledABlank = styled(ABlank)({
  display: 'inline-block',
  color: 'inherit',
  padding: '0.4em 0.3em',
  margin: '0 0.3em',
  borderRadius: 2,
  transition: 'all 0.3s',
})

const ABlankBlue = styled(StyledABlank)({
  '&:hover': {
    backgroundColor: theme.colors.darkblue,
  },
})

const ABlankRed = styled(StyledABlank)({
  '&:hover': {
    backgroundColor: theme.colors.darkred,
  },
})

const EditButton = styled.button({
  border: 'none',
  background: 'none',
  color: theme.colors.white,
  width: '1.1em',
  height: '1.1em',
  fontSize: '1.2em',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 0,
  position: 'absolute',
  top: theme.spacing.extraSmall,
  right: theme.spacing.extraSmall,
  filter: `drop-shadow(-1px -1px 1px ${theme.colors.black}) drop-shadow(1px 1px 1px ${theme.colors.black})`,
  transition: 'all 0.3s',
})

const StyledForm = styled(PostEditForm)({
  position: 'absolute',
  top: `calc(1.32em + 2 * ${theme.spacing.extraSmall}px)`,
  left: 0,
  width: '100%',
  transition: 'all 0.3s',
  overflow: 'auto auto',
})
