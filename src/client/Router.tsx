/* eslint-disable functional/no-expression-statements */
import { pipe } from 'fp-ts/function'
import qs from 'qs'
import { ReactElement, useEffect } from 'react'

import { PartialKlkPostsQuery } from '../shared/models/PartialKlkPostsQuery'
import { Dict, Maybe, Tuple } from '../shared/utils/fp'

import { About } from './pages/About'
import { Login } from './pages/Login'
import { NotFound } from './pages/NotFound'
import { Home } from './pages/home/Home'

export const routes = {
  home: (query: PartialKlkPostsQuery = {}): string => {
    const str = pipe(
      query,
      Dict.filter(isDefined),
      PartialKlkPostsQuery.encoder.encode,
      qs.stringify,
    )
    return `/${str === '' ? '' : `?${str}`}`
  },
  about: '/about',
}

type RouteElem = Tuple<Maybe<string>, ReactElement>

/* eslint-disable react/jsx-key */
function route(path: string): RouteElem {
  return pipe(
    Dict.lookup<RouteElem>(path, {
      '/': [Maybe.none, <Home />],
      '/about': [Maybe.some('About'), <About />],
      '/login': [Maybe.none, <Login />],
    }),
    Maybe.getOrElse<RouteElem>(() => [Maybe.some('Not found'), <NotFound />]),
  )
}
/* eslint-enable react/jsx-key */

type Props = {
  readonly path: string
}

export const Router = ({ path }: Props): JSX.Element => {
  const [subTitle, node] = route(path)
  const title = ['r/KillLaKill - u/iamonlyoneman', ...Maybe.toArray(subTitle)].join(' | ')

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    document.title = title
  }, [title])

  return node
}

function isDefined<A>(a: A | undefined): a is A {
  return a !== undefined
}
