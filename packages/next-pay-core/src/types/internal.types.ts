import { type CookieSerializeOptions } from 'cookie'

export type RequestInternal = {
  url: URL
  method: string
  headers: {
    [k: string]: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: Record<string, any> | undefined
  cookies: Record<string, string>
  error: string | undefined
  query: {
    [k: string]: string
  }
}
interface CookieOption {
  name: string
  options: CookieSerializeOptions
}
interface Cookie extends CookieOption {
  value: string
}

export interface ResponseInternal<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Body extends string | Record<string, any> | any[] = any,
> {
  status?: number
  headers?: Record<string, string>
  body?: Body
  redirect?: string
  cookies?: Cookie[]
}
