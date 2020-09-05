import React from 'react'

import { navigateTo } from '../utils/navigateTo'

type Props = Readonly<{
  to: string
}>

export const Navigate = ({ to }: Props): JSX.Element => {
  navigateTo(to)
  return <></>
}
