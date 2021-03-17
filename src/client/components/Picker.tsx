/* eslint-disable functional/no-expression-statement, functional/no-return-void */
import styled from '@emotion/styled'
import React, { useCallback, useEffect, useState } from 'react'

import { isDefined } from '../../shared/utils/isDefined'
import { useKlkPostsQuery } from '../contexts/KlkPostsQueryContext'
import { cssClasses } from '../utils/cssClasses'
import { theme } from '../utils/theme'
import { ClickOutside } from './ClickOutside'
import { ChevronUp } from './svgs'

type Props = {
  readonly labelPrefix?: React.ReactNode
  readonly labelValue: React.ReactNode
  readonly valueIsSelected: boolean
  readonly content: React.ReactNode
  readonly className?: string
}

const IS_OPENED = 'is-opened'
const SELECTED = 'selected'
const LABEL_PREFIX = 'label-prefix'
const LABEL_VALUE = 'label-value'
const CONTENT = 'content'

export const Picker = ({
  labelPrefix,
  labelValue,
  valueIsSelected,
  content,
  className,
}: Props): JSX.Element => {
  const query = useKlkPostsQuery()

  const [isOpened, setIsOpened] = useState(true)
  const toggleOpen = useCallback(() => setIsOpened(o => !o), [])
  const close = useCallback(() => setIsOpened(false), [])

  useEffect(() => {
    function onKeyUp(e: KeyboardEvent): void {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keyup', onKeyUp)
    return () => window.removeEventListener('keyup', onKeyUp)
  }, [close])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(close, [query])

  return (
    <ClickOutside onClickOutside={close}>
      <Container
        onClick={toggleOpen}
        className={cssClasses([SELECTED, valueIsSelected], [className, true])}
      >
        <Visible>
          {isDefined(labelPrefix) ? <span className={LABEL_PREFIX}>{labelPrefix}</span> : null}
          {isDefined(labelValue) ? <span className={LABEL_VALUE}>{labelValue}</span> : null}
          <ChevronDown />
        </Visible>
        <div className={cssClasses([CONTENT, true], [IS_OPENED, isOpened])}>{content}</div>
      </Container>
    </ClickOutside>
  )
}

const Container = styled.button({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: 'none',
  borderRadius: 2,
  padding: `0 ${theme.Header.link.padding.left}`,
  color: 'inherit',
  backgroundColor: 'transparent',
  lineHeight: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  position: 'relative',

  [`& .${LABEL_PREFIX}`]: {
    marginRight: theme.spacing.xxs,
    textDecoration: 'underline',
    position: 'relative',
  },

  [`& .${LABEL_PREFIX}::after`]: {
    content: "''",
    position: 'absolute',
    width: '100%',
    borderBottom: `2px solid ${theme.colors.lime}`,
    left: 0,
    bottom: -1,
    filter: `drop-shadow(1px 1px 0 ${theme.colors.darkgrey})`,
    opacity: 0,
    transition: 'all 0.3s',
  },

  [`&:hover .${LABEL_PREFIX}::after`]: {
    opacity: 1,
  },

  [`& .${LABEL_VALUE}`]: {
    borderRadius: 2,
    padding: `${theme.Header.link.padding.top} ${theme.Header.link.padding.left}`,
    position: 'relative',
    transition: 'all 0.3s',
  },

  [`&.${SELECTED} .${LABEL_VALUE}`]: {
    textDecoration: 'underline',
    textShadow: theme.textShadow(theme.colors.darkgrey),
    backgroundColor: theme.colors.lime,
    boxShadow: theme.boxShadowLight,
  },

  [`& .${LABEL_VALUE}::after`]: {
    content: "''",
    position: 'absolute',
    width: `calc(100% - 2 * ${theme.Header.link.padding.left})`,
    left: theme.Header.link.padding.left,
    bottom: `calc(${theme.Header.link.padding.top} - 1px)`,
    filter: `drop-shadow(1px 1px 0 ${theme.colors.darkgrey})`,
    opacity: 0,
    transition: 'all 0.3s',
  },

  [`&.${SELECTED} .${LABEL_VALUE}::after`]: {
    borderBottom: `2px solid ${theme.colors.white}`,
    filter: 'none',
  },

  [`&:hover .${LABEL_VALUE}::after`]: {
    opacity: 1,
  },

  [`& .${CONTENT}`]: {
    position: 'absolute',
    top: 'calc(100% + 0.33em)',
    zIndex: theme.zIndexes.pickerContent,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    boxShadow: theme.boxShadow,
    opacity: 0,
    filter: 'blur(10px)',
    visibility: 'hidden',
    transition: 'all 0.3s',
    [theme.mediaQueries.desktop]: {
      // left: 0,
    },
    [theme.mediaQueries.mobile]: {
      right: 0,
    },
  },

  [`&:hover .${CONTENT}, & .${CONTENT}.${IS_OPENED}`]: {
    opacity: 1,
    filter: 'blur(0)',
    visibility: 'visible',
  },
})

const Visible = styled.span({
  display: 'flex',
  alignItems: 'center',
})

const ChevronDown = styled(ChevronUp)({
  marginLeft: theme.spacing.xxs,
  transform: 'rotate(-180deg)',
})
