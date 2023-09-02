import { parse as parseCookie, serialize } from 'cookie'
import { UnknownAction } from './helpers/errors.helpers'
import { readJSONBody } from './helpers/http.helpers'
import { ResponseInternal } from './types/internal.types'
import { HTTPMethod, isHandler, PayscriptTrie } from './helpers/routing.helpers'

type InternalOptions = {
  basePath?: string
}

async function requestToInternalResponse(
  req: Request,
  trie: PayscriptTrie,
  options: InternalOptions = {},
): Promise<ResponseInternal | Error> {
  try {
    const url = new URL(req.url.replace(/\/$/, ''))
    const { pathname } = url

    const method = req.method ?? HTTPMethod.GET

    const { basePath } = options

    const finalPathname = basePath ? pathname.replace(basePath, '') : pathname

    const match = trie.match(finalPathname)

    if (!match) throw new UnknownAction('Cannot detect action.')

    const handler = match.node?.getHandler(method)

    if (!isHandler(handler)) throw new UnknownAction('Cannot detect action.')

    const internal = {
      url,
      method,
      headers: Object.fromEntries(req.headers),
      body: req.body ? await readJSONBody(req.body) : undefined,
      cookies: parseCookie(req.headers.get('cookie') ?? '') ?? {},
      error: url.searchParams.get('error') ?? undefined,
      query: Object.fromEntries(url.searchParams),
    }

    return handler({
      req: internal,
      params: match.params,
      originalRequest: req,
    })
  } catch (error) {
    return error as Error
  }
}
function toResponse(res: ResponseInternal): Response {
  const headers = new Headers(res.headers)

  res.cookies?.forEach(cookie => {
    const { name, value, options } = cookie
    const cookieHeader = serialize(name, value, options)

    if (headers.has('Set-Cookie')) {
      headers.append('Set-Cookie', cookieHeader)
    } else {
      headers.set('Set-Cookie', cookieHeader)
    }
  })

  const body =
    headers.get('content-type') === 'application/json'
      ? JSON.stringify(res.body)
      : res.body

  const response = new Response(body, {
    headers,
    status: res.redirect ? 302 : res.status ?? 200,
  })

  if (res.redirect) {
    response.headers.set('Location', res.redirect)
  }

  return response
}
export const processRequest = async (
  request: Request,
  trie: PayscriptTrie,
  options: InternalOptions = {},
): Promise<Response> => {
  const internalResponse = await requestToInternalResponse(
    request,
    trie,
    options,
  )

  if (internalResponse instanceof UnknownAction) {
    return new Response(
      `Error: This action with HTTP ${request.method} is not supported.`,
      { status: 404 },
    )
  } else if (internalResponse instanceof Error) {
    return new Response(
      `Error: There was an error while processing your request.`,
      { status: 400 },
    )
  }

  return toResponse(internalResponse)
}
