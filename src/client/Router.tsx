import qs from 'qs'
import React, { ReactElement, useEffect } from 'react'

import { PartialKlkPostQuery } from '../shared/models/PartialKlkPostQuery'
import { Dict, Maybe, pipe } from '../shared/utils/fp'
import { About } from './pages/About'
import { Home } from './pages/home/Home'
import { NotFound } from './pages/NotFound'

export const routes = {
  home: (query: PartialKlkPostQuery = {}): string => {
    const str = qs.stringify(PartialKlkPostQuery.encoder.encode(query))
    return `/${str === '' ? '' : '?'}${str}`
  },
  about: '/about',
}

/* eslint-disable react/jsx-key */
function route(path: string): [Maybe<string>, ReactElement] {
  return pipe(
    Dict.lookup<[Maybe<string>, ReactElement]>(path, {
      '/': [Maybe.none, <Home />],
      '/about': [Maybe.some('About'), <About />],
    }),
    Maybe.getOrElse(() => [Maybe.some('Not found'), <NotFound />]),
  )
}
/* eslint-enable react/jsx-key */

type Props = Readonly<{
  path: string
}>

export const Router = ({ path }: Props): JSX.Element => {
  const [subTitle, node] = route(path)
  const title = ['/r/KillLaKill - /u/iamonlyoneman', ...Maybe.toArray(subTitle)].join(' | ')

  useEffect(() => {
    document.title = title
  }, [title])

  return node
}
