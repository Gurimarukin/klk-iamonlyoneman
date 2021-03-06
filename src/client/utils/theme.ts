import { ThumbnailSuffix } from './thumbnailUrl'

const spacing = {
  xxs: 6,
  xs: 8,
  s: 16,
  m: 26,
  l: 38,
  xl: 52,
}

const colors = {
  white: '#ffffff',
  black: '#010101',
  red: '#a32510',
  darkred: '#9b3957',
  darkblue: '#3f61d4',
  darkgrey: '#1A1D2C',
  beige1: '#f5dae4',
  beige2: '#ddb6af',
  ocre: '#c1bd46',
  darklila: '#440821',
  lila: '#71486e',
  lime: '#46c196',
  lemon: '#f4ee6f',
  pink1: '#e994bc',
  pink2: '#ed69d0',
}

const mobileLimit = 664
const js = {
  mobile: `(max-width: ${mobileLimit}px)`,
  desktop: `(min-width: ${mobileLimit + 1}px)`,
}
const mediaQueries = {
  mobile: `@media ${js.mobile}`,
  desktop: `@media ${js.desktop}`,
  js,
}

const galleryThumnailSuffix: ThumbnailSuffix = 'h'
const galleryThumnailMaxSize = ThumbnailSuffix.maxSizes[galleryThumnailSuffix]

const textShadow = (color: string): string => `1px 1px 0 ${color}`

export const theme = {
  colors,

  spacing,

  boxShadow: '0 0 8px black',
  boxShadowLight: '0 0 4px black',
  textOutline: '-1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black, 1px 1px 1px black',
  textShadow,
  dropShadow: (color: string): string => `drop-shadow(${textShadow(color)})`,

  Gallery: {
    smallestSide: 500,
    thumbnail: {
      suffix: galleryThumnailSuffix,
      maxSize: galleryThumnailMaxSize,
    },
    margin: spacing.xs,
    maxHeight: 0.9, // * 100vh
  },

  Header: {
    gradient: `linear-gradient(135deg, ${colors.darklila} 0%, ${colors.lila} 100%)`,
    link: {
      padding: {
        top: '0.4em',
        left: '0.3em',
      },
      underline: {
        top: 'calc(1.4em + 1px)',
      },
    },
    search: {
      underline: {
        bottom: '0.2em',
      },
    },
  },

  zIndexes: {
    pickerContent: 70,
  },

  mediaQueries,

  experimental: [
    {
      name: 'Nonon',
      values: ['#440821', '#C1BD46', '#F5DAE4', '#ED69D0', '#C52072'],
    },
    { name: 'Credits', values: ['#4C82D8', '#5E62A9', '#71486E', '#9E4C65', '#030303'] },
    { name: 'Ryuko 1', values: ['#E994BC', '#A32510', '#1A1D2C', '#46C196', '#F4EE6F'] },
    { name: 'Ryuko 2', values: ['#DDB6AF', '#7E6572', '#303142', '#B63016', '#A75549'] },
  ],
}
