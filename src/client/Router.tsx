import qs from 'qs'
import React, { ReactElement, useEffect } from 'react'

import { PartialKlkPostQuery } from '../shared/models/PartialKlkPostQuery'
import { Dict, Maybe, pipe } from '../shared/utils/fp'
import { About } from './pages/About'
import { Home } from './pages/home/Home'
import { Login } from './pages/Login'
import { NotFound } from './pages/NotFound'

export const routes = {
  home: (query: PartialKlkPostQuery = {}): string => {
    const str = pipe(
      query,
      Dict.filter(isDefined),
      PartialKlkPostQuery.encoder.encode,
      qs.stringify,
    )
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
      '/login': [Maybe.none, <Login />],
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

function isDefined<A>(a: A | undefined): a is A {
  return a !== undefined
}
