import { AxiosResponse } from 'axios'

export type AxiRes<A = unknown> = AxiosResponse<A>

export namespace AxiRes {
  export function map<A, B>(f: (a: A) => B): (fa: AxiRes<A>) => AxiRes<B> {
    return fa => ({ ...fa, data: f(fa.data) })
  }
}
