const { API_HOST } = process.env

if (API_HOST === undefined) {
  // eslint-disable-next-line functional/no-throw-statements
  throw Error('Missing env var API_HOST')
}

export const Config = { apiHost: API_HOST }
