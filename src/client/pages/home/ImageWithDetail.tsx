/* eslint-disable functional/no-return-void */
import styled from '@emotion/styled'
import { pipe } from 'fp-ts/function'
import React, { forwardRef, useCallback, useMemo, useState } from 'react'
import { LazyLoadImage, ScrollPosition } from 'react-lazy-load-image-component'

import { KlkPostDAO } from '../../../shared/models/klkPost/KlkPostDAO'
import { Size } from '../../../shared/models/klkPost/Size'
import { Token } from '../../../shared/models/Token'
import { Maybe } from '../../../shared/utils/fp'
import { StringUtils } from '../../../shared/utils/StringUtils'
import { ABlank } from '../../components/ABlank'
import { ClickOutside } from '../../components/ClickOutside'
import { Pencil } from '../../components/svgs'
import { useUser } from '../../contexts/UserContext'
import { cssClasses } from '../../utils/cssClasses'
import { theme } from '../../utils/theme'
import { thumbnailUrl } from '../../utils/thumbnailUrl'
import { PostEditForm } from './PostEditForm'

type ImageWithDetailProps = {
  readonly scrollPosition: ScrollPosition
  readonly resizeImg: (size: Size) => Size
  readonly post: KlkPostDAO
}

export const ImageWithDetail = (props: ImageWithDetailProps): JSX.Element => {
  const { token } = useUser()

  return pipe(
    token,
    Maybe.fold(
      () => <SimpleImageWithDetail {...props} />,
      t => <EditableImageWithDetail {...props} token={t} />,
    ),
  )
}

type EditableImageWithDetailProps = ImageWithDetailProps & {
  readonly token: Token
}

const EditableImageWithDetail = (props: EditableImageWithDetailProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = useCallback(() => setIsEditing(e => !e), [])
  const closeEditing = useCallback(() => setIsEditing(false), [])

  return (
    <ClickOutside onClickOutside={closeEditing}>
      <SimpleImageWithDetail {...props} isEditing={isEditing} toggleEditing={toggleEditing} />
    </ClickOutside>
  )
}

const MobileImageWithDetail = forwardRef<HTMLDivElement, StatelessImageWithDetailProps>(
  (props, ref) => <StatelessImageWithDetail ref={ref} {...props} />,
)

type StatelessImageWithDetailProps = ImageWithDetailProps & {
  readonly token?: Token
  readonly isEditing?: boolean
  readonly toggleEditing?: () => void
}

const PLACEHOLDER = 'placeholder'
const DETAIL = 'detail'
const EDIT_BTN = 'editBtn'
const EDITING = 'editing'

const StatelessImageWithDetail = forwardRef<HTMLDivElement, StatelessImageWithDetailProps>(
  ({ scrollPosition, resizeImg, post, token, isEditing = false, toggleEditing }, ref) => {
    const size: Partial<Size> = useMemo(
      () =>
        pipe(
          post.size,
          Maybe.fold(() => ({ height: theme.Gallery.smallestSide }), resizeImg),
        ),
      [post.size, resizeImg],
    )
    const permalink = `https://reddit.com${post.permalink}`

    return (
      <Container ref={ref} className={cssClasses([EDITING, isEditing])}>
        <ABlank href={post.url}>
          <StyledImage
            alt={post.title}
            src={thumbnailUrl(post.url, theme.Gallery.thumbnail.suffix)}
            scrollPosition={scrollPosition}
            effect='blur'
            wrapperClassName={PLACEHOLDER}
            {...size}
          />
        </ABlank>
        <TitleContainer style={{ width: size.width }}>
          <TitleABlank href={permalink}>{post.title}</TitleABlank>
          <div className={DETAIL}>
            <span>
              {StringUtils.formatDate(post.createdAt)}
              {pipe(
                post.episode,
                Maybe.map(e => ` • E${StringUtils.pad10(e)}`),
                Maybe.toNullable,
              )}
            </span>
            <Links>
              <ABlankBlue href={post.url}>View image</ABlankBlue>•
              <ABlankRed href={permalink}>Reddit post</ABlankRed>
            </Links>
          </div>
        </TitleContainer>
        {token !== undefined ? (
          <>
            <EditButton onClick={toggleEditing} className={EDIT_BTN}>
              <Pencil />
            </EditButton>
            <StyledForm token={token} post={post}>
              form
            </StyledForm>
          </>
        ) : null}
      </Container>
    )
  },
)

const SimpleImageWithDetail = window.matchMedia(theme.mediaQueries.js.mobile).matches
  ? MobileImageWithDetail
  : StatelessImageWithDetail

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
  top: theme.spacing.xs,
  right: theme.spacing.xs,
  filter: `drop-shadow(-1px -1px 1px ${theme.colors.black}) drop-shadow(1px 1px 1px ${theme.colors.black})`,
  transition: 'all 0.3s',
})

const StyledForm = styled(PostEditForm)({
  position: 'absolute',
  top: `calc(1.32em + 2 * ${theme.spacing.xs}px)`,
  left: 0,
  width: '100%',
  transition: 'all 0.3s',
  overflow: 'auto auto',
})
