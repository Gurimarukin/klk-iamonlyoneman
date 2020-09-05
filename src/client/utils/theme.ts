const spacing = {
  extraSmall: 8,
  small: 16,
  medium: 26,
  large: 38,
  extraLarge: 52,
}

export const theme = {
  colors: {
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
  },

  spacing,

  boxShadow: '0 0 8px black',
  boxShadowLight: '0 0 4px black',
  textOutline: '-1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black, 1px 1px 1px black',
  textShadow: (color: string): string => `1px 1px 0 ${color}`,

  Gallery: {
    smallestSide: 500,
    margin: spacing.extraSmall,
    maxHeight: 0.9, // * 100vh
  },

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
