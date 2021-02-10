export namespace Config {
  declare const process: {
    readonly env: {
      readonly API_HOST?: string
    }
  }

  export const apiHost: string = (() => {
    if (process.env.API_HOST === undefined) {
      // eslint-disable-next-line functional/no-throw-statement
      throw Error('Missing env var API_HOST')
    }
    return process.env.API_HOST
  })()
}
