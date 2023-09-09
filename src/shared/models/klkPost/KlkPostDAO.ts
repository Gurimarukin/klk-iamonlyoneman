import { boolean, number } from 'fp-ts'
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'

import { List, Maybe } from '../../utils/fp'
import { DateFromISOString } from '../DateFromISOString'
import { KlkPostsQuery } from '../KlkPostsQuery'
import { EpisodeNumber } from '../PartialKlkPostsQuery'
import { KlkPostId } from './KlkPostId'
import { Size } from './Size'

const maybeNumberEq: Eq<Maybe<number>> = Maybe.getEq(number.Eq)

type KlkPostDAO = C.TypeOf<typeof codec>

const codec = C.struct({
  id: KlkPostId.codec,
  url: C.string,
  title: C.string,
  episode: Maybe.codec(C.number),
  size: Maybe.codec(Size.codec),
  createdAt: DateFromISOString.codec,
  permalink: C.string,
  active: C.boolean,
  noLongerAvailable: Maybe.codec(C.boolean),
})

const matchesQuery =
  (query: KlkPostsQuery) =>
  (post: KlkPostDAO): boolean => {
    const matchesEpisode = maybeNumberEq.equals(
      post.episode,
      pipe(query.episode, Maybe.filter(EpisodeNumber.isNumb)),
    )
    const matchesSearch =
      Maybe.isNone(query.search) ||
      post.title.toLowerCase().match(query.search.value.toLowerCase()) !== null

    const matchesActive = boolean.Eq.equals(post.active, query.active)

    return matchesEpisode && matchesSearch && matchesActive
  }

const KlkPostDAO = { codec, matchesQuery }

type KlkPostDAOs = C.TypeOf<typeof klkPostDAOSCodec>

const klkPostDAOSCodec = C.array(codec) as unknown as C.Codec<
  unknown,
  List<C.OutputOf<typeof codec>>,
  List<KlkPostDAO>
> // TODO: cast bad

const KlkPostDAOs = { codec: klkPostDAOSCodec }

export { KlkPostDAO, KlkPostDAOs }
