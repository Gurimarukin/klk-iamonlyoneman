import * as C from 'io-ts/Codec'

export namespace Size {
  export const codec = C.type({
    width: C.number,
    height: C.number,
  })
}

export type Size = C.TypeOf<typeof Size.codec>
