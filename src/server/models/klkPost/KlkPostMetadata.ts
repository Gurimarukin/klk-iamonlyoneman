import * as C from 'io-ts/lib/Codec'

export namespace KlkPostMetadata {
  export const codec = C.type({
    episode: C.number,
    width: C.number,
    height: C.number,
  })
}

export type KlkPostMetadata = C.TypeOf<typeof KlkPostMetadata.codec>
