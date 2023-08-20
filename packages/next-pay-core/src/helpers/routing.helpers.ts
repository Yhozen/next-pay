import { type Params, Node as TrieNode, Trie } from 'route-trie'

import type { RequestInternal, ResponseInternal } from '../types/internal.types'

export const enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  HEAD = 'HEAD',
}

export type PayscriptHandler = (ctx: {
  req: RequestInternal
  params: Params
  originalRequest: Request
}) => ResponseInternal | Promise<ResponseInternal>

class PayscriptNode extends TrieNode {
  handle!: (
    method: HTTPMethod,
    handler: PayscriptHandler,
  ) => Awaited<ReturnType<PayscriptHandler>>
}

export class PayscriptTrie extends Trie {
  define(pattern: string): PayscriptNode {
    return super.define(pattern) as PayscriptNode
  }
}

export const isHandler = (handler: unknown): handler is PayscriptHandler => {
  return typeof handler === 'function'
}
