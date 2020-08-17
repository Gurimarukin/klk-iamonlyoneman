export namespace Config {
  declare const process: Readonly<{
    env: Readonly<{
      API_HOST?: string
    }>
  }>

  export const apiHost: string = (() => {
    if (process.env.API_HOST === undefined) {
      throw Error('Missing env var API_HOST')
    }
    return process.env.API_HOST
  })()
}
