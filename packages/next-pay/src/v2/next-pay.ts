import type { NextApiRequest, NextApiResponse } from 'next'
import { type Options, NextPayIntegration, PayCore } from 'next-pay-core'

import { getBasePath } from './get-base-path'
import { getBody, getURL, setHeaders } from './http.helpers'
import {
  integrationArrayToObject,
  IntegrationsAsObject,
} from './integrations-parser'
import type { NamedIntegration } from './named-integration.type'

type IntegrationsBase = Record<string, typeof NextPayIntegration>

async function NextPayHandler<Integrations extends IntegrationsBase>(
  req: NextApiRequest,
  res: NextApiResponse,
  payCore: PayCore<Integrations>,
  options: NextPayOptions<Integrations>,
) {
  const headers = new Headers(req.headers as unknown as HeadersInit)
  const url = getURL(req.url, headers)

  if (url instanceof Error) {
    if (process.env.NODE_ENV !== 'production') throw url

    const errorLogger = console.error

    errorLogger('INVALID_URL', url)
    res.status(400).json({ message: 'Bad query' })

    return res.json({
      message:
        'There is a problem with the server configuration. Check the server logs for more information.',
    })
  }

  const request = new Request(url, {
    headers,
    method: req.method,
    ...getBody(req),
  })

  const response = await payCore.processRequest(request)

  res.status(response.status)
  setHeaders(response.headers, res)

  return res.send(await response.text())
}

export class NextPay<Integrations extends IntegrationsBase> {
  payCore: PayCore<Integrations>
  constructor(private options: NextPayOptions<Integrations>) {
    const integrations = Object.values(options.integrations)

    this.payCore = new PayCore<Integrations>({
      integrations,
      basePath: options.basePath,
      integrationConfig: options.integrationConfig,
      adapter: options.adapter,
    })
    // like the good old days :')
    this.handler = this.handler.bind(this)
  }

  static create<Integrations extends IntegrationsBase>(
    options: NextPayOptions<Integrations>,
  ) {
    return new NextPay(options)
  }
  handler(req: NextApiRequest, res: NextApiResponse) {
    return NextPayHandler(req, res, this.payCore, this.options)
  }
}

type NextPayOptions<Integrations> = {
  integrations: Integrations
  basePath?: string
  name: string
  integrationConfig?: Options['integrationConfig']
  adapter: Options['adapter']
}

type NextPayOptionsInput<
  Integrations extends readonly [...NamedIntegration[]],
> = {
  integrations: Integrations
  basePath?: string
  name: string
  integrationConfig?: Options['integrationConfig']
  adapter: Options['adapter']
}

export const defineNextPayConfig = <
  Integrations extends readonly [...NamedIntegration[]],
>({
  integrations: integrationsArray,
  ...config
}: NextPayOptionsInput<Integrations>): NextPayOptions<
  IntegrationsAsObject<Integrations>
> => {
  let basePath: string | undefined = config.basePath

  const integrations = integrationArrayToObject(integrationsArray)

  if (!basePath) {
    basePath = getBasePath()
  }
  return { basePath, ...config, integrations }
}

export { NextApiRequest, NextApiResponse }

export type InferIntegrationType<T> = T extends NextPayOptions<infer U>
  ? U
  : never
