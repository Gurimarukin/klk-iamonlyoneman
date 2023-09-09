import { Future, NotUsed } from '../../../shared/utils/fp'

export type TObserver<A> = {
  next: (value: A) => Future<NotUsed>
}
