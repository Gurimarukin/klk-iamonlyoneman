import {
  AxiosAdapter,
  AxiosBasicCredentials,
  AxiosProxyConfig,
  AxiosTransformer,
  CancelToken,
  Method,
  ResponseType,
} from 'axios'

import { Dict } from '../../shared/utils/fp'

import { RedditSort } from '../models/RedditSort'

// copy-pasta from AxiosRequestConfig
export type AxiosConfig = Readonly<{
  url?: string
  method?: Method
  baseURL?: string
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]
  headers?: Dict<string>
  params?: Dict<string>
  paramsSerializer?: (params: unknown) => string
  data?: unknown
  timeout?: number
  timeoutErrorMessage?: string
  withCredentials?: boolean
  adapter?: AxiosAdapter
  auth?: AxiosBasicCredentials
  responseType?: ResponseType
  xsrfCookieName?: string
  xsrfHeaderName?: string
  onUploadProgress?: (progressEvent: unknown) => void
  onDownloadProgress?: (progressEvent: unknown) => void
  maxContentLength?: number
  validateStatus?: (status: number) => boolean
  maxRedirects?: number
  socketPath?: string | null
  httpAgent?: unknown
  httpsAgent?: unknown
  proxy?: AxiosProxyConfig | false
  cancelToken?: CancelToken
}>

export namespace AxiosConfig {
  export function setParamSort(value: RedditSort): (c: AxiosConfig) => AxiosConfig {
    return setParam('sort', value)
  }

  export function setParam(key: string, value: string): (c: AxiosConfig) => AxiosConfig {
    return c => ({ ...c, params: { ...c.params, [key]: value } })
  }
}
