import React from 'react'

export const ABlank = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element => {
  const { children, target: _1, rel: _2, ...otherProps } = props
  return (
    <a target='_blank' rel='noreferrer' {...otherProps}>
      {children}
    </a>
  )
}
