import { IO, NotUsed } from '../../../shared/utils/fp'

export type TSubject<A> = {
  next: (value: A) => IO<NotUsed>
  complete: IO<NotUsed>
}
