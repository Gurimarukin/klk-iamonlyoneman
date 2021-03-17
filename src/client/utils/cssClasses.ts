import { pipe } from 'fp-ts/function'

import { List, Maybe, Tuple } from '../../shared/utils/fp'

export const cssClasses = (
  ...classes: List<Tuple<string | undefined, boolean>>
): string | undefined => {
  const res = pipe(
    classes,
    List.filterMap(
      ([className, display]): Maybe<string> =>
        display && className !== undefined ? Maybe.some(className) : Maybe.none,
    ),
  )
  return List.isEmpty(res) ? undefined : res.join(' ')
}
