export namespace Config {
  export const apiHost: string = (() => {
    const { API_HOST } = process.env

    if (API_HOST === undefined) {
      // eslint-disable-next-line functional/no-throw-statements
      throw Error('Missing env var API_HOST')
    }
    return API_HOST
  })()
}
