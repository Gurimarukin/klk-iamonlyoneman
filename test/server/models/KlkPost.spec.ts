import { Maybe } from '../../../src/shared/utils/fp'

import { imgurId, metadataFromTitle } from '../../../src/server/models/KlkPost'

describe('metadataFromTitle', () => {
  it('should parse title', () => {
    expect(
      metadataFromTitle('Ryuko vs Satsuki from the episode intro (episode 19) [2018x1261]'),
    ).toEqual({
      episode: Maybe.some(19),
      size: Maybe.some({ width: 2018, height: 1261 }),
    })

    expect(
      metadataFromTitle(
        'Ragyo attacks, from the POV of the person being pummeled (a few different shots in comments) (from Episode 18) [1953x1225]',
      ),
    ).toEqual({
      episode: Maybe.some(18),
      size: Maybe.some({ width: 1953, height: 1225 }),
    })

    expect(
      metadataFromTitle('A few pics of Ira and his big sucky gun thing (from Episode 19)'),
    ).toEqual({
      episode: Maybe.some(19),
      size: Maybe.none,
    })

    expect(
      metadataFromTitle(
        'The Lady Ragyo Chokes Her True Enemy (from Episode 18) MEGA [spoiler] [1920x2396]',
      ),
    ).toEqual({
      episode: Maybe.some(18),
      size: Maybe.some({ width: 1920, height: 2396 }),
    })

    expect(
      metadataFromTitle(
        "You wouldn't hurt your Mother, would you dear? (with a couple of interesting variants in comments) (from Episode 18) [3036x1027][spoiler]",
      ),
    ).toEqual({
      episode: Maybe.some(18),
      size: Maybe.some({ width: 3036, height: 1027 }),
    })

    expect(
      metadataFromTitle('Ryuko pulls on a loose thread, restored version (episode 18) [1920x2058]'),
    ).toEqual({
      episode: Maybe.some(18),
      size: Maybe.some({ width: 1920, height: 2058 }),
    })

    expect(metadataFromTitle('These students look unhappy (from Episode 19) [2858x1059')).toEqual({
      episode: Maybe.some(19),
      size: Maybe.some({ width: 2858, height: 1059 }),
    })

    expect(metadataFromTitle('Very title  2858x1059')).toEqual({
      episode: Maybe.none,
      size: Maybe.some({ width: 2858, height: 1059 }),
    })

    expect(metadataFromTitle('Ryuko listening to her uniform (episode 17) [1920 x 2176]')).toEqual({
      episode: Maybe.some(17),
      size: Maybe.some({ width: 1920, height: 2176 }),
    })

    expect(metadataFromTitle('Mako outfit collage (episode 17)[5584x1080]')).toEqual({
      episode: Maybe.some(17),
      size: Maybe.some({ width: 5584, height: 1080 }),
    })

    expect(metadataFromTitle('Monochrome Lady Ragyo (from Episode 16) [1920X1595]')).toEqual({
      episode: Maybe.some(16),
      size: Maybe.some({ width: 1920, height: 1595 }),
    })
  })
})

describe('imgurId', () => {
  it('should parse url', () => {
    expect(imgurId('https://imgur.com/cHZ6iZW')).toEqual(Maybe.some('cHZ6iZW'))
    expect(imgurId('https://blbl.ch/cHZ6iZW')).toEqual(Maybe.none)
  })
})
