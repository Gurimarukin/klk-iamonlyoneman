import { pipe } from 'fp-ts/function'
import type { Status } from 'hyper-ts'
import { Dict, List, NonEmptyArray } from '../../../shared/utils/fp'
import { DictUtils } from '../../utils/DictUtils'

type SimpleHttpResponse = {
  status: Status
  body: string
  headers: Dict<string, NonEmptyArray<string>>
}

const of = (
  status: Status,
  body: string,
  headers: Dict<string, NonEmptyArray<string>> = {},
): SimpleHttpResponse => ({ status, body, headers })

const toRawHttp = ({ status, body, headers }: SimpleHttpResponse): string =>
  pipe(
    [
      `HTTP/1.1 ${status}`,
      ...pipe(
        headers,
        DictUtils.entries,
        List.map(([key, val]) => `${key}: ${pipe(val, List.mkString('; '))}`),
      ),
      '',
      body,
    ],
    List.mkString('', '\r\n', '\r\n'),
  )

const SimpleHttpResponse = { of, toRawHttp }

export { SimpleHttpResponse }
