import * as axios from 'axios'

import { Dict, List } from '../../shared/utils/fp'

import { RedditSort } from '../models/RedditSort'

// copy-pasta from AxiosRequestConfig
export type AxiosConfig = {
  readonly url?: string
  readonly method?: axios.Method
  readonly baseURL?: string
  readonly transformRequest?: axios.AxiosTransformer | List<axios.AxiosTransformer>
  readonly transformResponse?: axios.AxiosTransformer | List<axios.AxiosTransformer>
  readonly headers?: Dict<string, string>
  readonly params?: Dict<string, string>
  readonly paramsSerializer?: (params: unknown) => string
  readonly data?: unknown
  readonly timeout?: number
  readonly timeoutErrorMessage?: string
  readonly withCredentials?: boolean
  readonly adapter?: axios.AxiosAdapter
  readonly auth?: axios.AxiosBasicCredentials
  readonly responseType?: ResponseType
  readonly xsrfCookieName?: string
  readonly xsrfHeaderName?: string
  /* eslint-disable functional/no-return-void */
  readonly onUploadProgress?: (progressEvent: unknown) => void
  readonly onDownloadProgress?: (progressEvent: unknown) => void
  /* eslint-enable functional/no-return-void */
  readonly maxContentLength?: number
  readonly validateStatus?: (status: number) => boolean
  readonly maxRedirects?: number
  readonly socketPath?: string | null
  readonly httpAgent?: unknown
  readonly httpsAgent?: unknown
  readonly proxy?: axios.AxiosProxyConfig | false
  readonly cancelToken?: axios.CancelToken
}

export namespace AxiosConfig {
  export const setParamSort = (value: RedditSort): ((c: AxiosConfig) => AxiosConfig) =>
    setParam('sort', value)

  export const setParam =
    (key: string, value: string) =>
    (c: AxiosConfig): AxiosConfig => ({
      ...c,
      params: { ...c.params, [key]: value },
    })
}
