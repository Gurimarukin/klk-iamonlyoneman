import { Maybe } from '../../../src/shared/utils/fp'

import { imgurId, metadataFromTitle } from '../../../src/server/models/KlkPost'

import { expectT } from '../../expectT'

describe('metadataFromTitle', () => {
  it('should parse title', () => {
    expectT(
      metadataFromTitle('Ryuko vs Satsuki from the episode intro (episode 19) [2018x1261]'),
    ).toStrictEqual({
      episode: Maybe.some(19),
      size: Maybe.some({ width: 2018, height: 1261 }),
    })

    expectT(
      metadataFromTitle(
        'Ragyo attacks, from the POV of the person being pummeled (a few different shots in comments) (from Episode 18) [1953x1225]',
      ),
    ).toStrictEqual({
      episode: Maybe.some(18),
      size: Maybe.some({ width: 1953, height: 1225 }),
    })

    expectT(
      metadataFromTitle('A few pics of Ira and his big sucky gun thing (from Episode 19)'),
    ).toStrictEqual({
      episode: Maybe.some(19),
      size: Maybe.none,
    })

    expectT(
      metadataFromTitle(
        'The Lady Ragyo Chokes Her True Enemy (from Episode 18) MEGA [spoiler] [1920x2396]',
      ),
    ).toStrictEqual({
      episode: Maybe.some(18),
      size: Maybe.some({ width: 1920, height: 2396 }),
    })

    expectT(
      metadataFromTitle(
        "You wouldn't hurt your Mother, would you dear? (with a couple of interesting variants in comments) (from Episode 18) [3036x1027][spoiler]",
      ),
    ).toStrictEqual({
      episode: Maybe.some(18),
      size: Maybe.some({ width: 3036, height: 1027 }),
    })

    expectT(
      metadataFromTitle('Ryuko pulls on a loose thread, restored version (episode 18) [1920x2058]'),
    ).toStrictEqual({
      episode: Maybe.some(18),
      size: Maybe.some({ width: 1920, height: 2058 }),
    })

    expectT(
      metadataFromTitle('These students look unhappy (from Episode 19) [2858x1059'),
    ).toStrictEqual({
      episode: Maybe.some(19),
      size: Maybe.some({ width: 2858, height: 1059 }),
    })

    expectT(metadataFromTitle('Very title  2858x1059')).toStrictEqual({
      episode: Maybe.none,
      size: Maybe.some({ width: 2858, height: 1059 }),
    })

    expectT(
      metadataFromTitle('Ryuko listening to her uniform (episode 17) [1920 x 2176]'),
    ).toStrictEqual({
      episode: Maybe.some(17),
      size: Maybe.some({ width: 1920, height: 2176 }),
    })

    expectT(metadataFromTitle('Mako outfit collage (episode 17)[5584x1080]')).toStrictEqual({
      episode: Maybe.some(17),
      size: Maybe.some({ width: 5584, height: 1080 }),
    })

    expectT(metadataFromTitle('Monochrome Lady Ragyo (from Episode 16) [1920X1595]')).toStrictEqual(
      {
        episode: Maybe.some(16),
        size: Maybe.some({ width: 1920, height: 1595 }),
      },
    )
  })
})

describe('imgurId', () => {
  it('should parse url', () => {
    expectT(imgurId('https://imgur.com/cHZ6iZW')).toStrictEqual(Maybe.some('cHZ6iZW'))
    expectT(imgurId('https://blbl.ch/cHZ6iZW')).toStrictEqual(Maybe.none)
  })
})
