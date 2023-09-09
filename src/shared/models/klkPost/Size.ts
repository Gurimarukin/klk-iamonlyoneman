import * as C from 'io-ts/Codec'

type Size = C.TypeOf<typeof codec>

const codec = C.struct({
  width: C.number,
  height: C.number,
})

const Size = { codec }

export { Size }
