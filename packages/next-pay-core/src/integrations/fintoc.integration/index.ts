import { HTTPMethod, PayscriptHandler } from 'helpers/routing.helpers'
import { validateSchema } from 'helpers/validation.helpers'
import { Readable } from 'stream'
import Container, { Inject, Service } from 'typedi'
import { z } from 'zod'

import { SupportedCurrencies } from '../../constants/supported-currencies'
import { getValueFrom } from '../../helpers/integration.helpers'
import { NextPayOrderStatus } from '../../types/pay-order-status.type'
import { NextPayIntegration } from '../base.integration'

import { FintocIntegrationConfig } from './config'
import { FintocService } from './service'
import { BASE_PATH_TOKEN } from 'constants/tokens'

@Service()
export class FintocIntegration extends NextPayIntegration {
  static integrationName = 'fintoc' as const

  static supportedCurrencies = [SupportedCurrencies.CLP] as const
  supportedCurrencies = FintocIntegration.supportedCurrencies

  @Inject()
  protected fintocService!: FintocService

  config!: FintocIntegrationConfig

  async onCreate() {
    throw new Error("override Fintoc's onCreate method")
  }

  async getOrderStatus(
    orderId: string,
    name?: string,
  ): Promise<{ status: NextPayOrderStatus }> {
    console.log({ orderId })

    const status =
      Math.random() < 0.5
        ? NextPayOrderStatus.APPROVED
        : NextPayOrderStatus.PENDING
    return { status }
  }

  async createPaymentRequest(
    amount: string,
    orderId: string,
    referenceId: string,
    name?: string,
  ) {
    const secretKey = await this.getAccessToken(name)

    const payment = await this.fintocService.createPayment({
      secretKey,
      amount: Number(amount),
      currency: 'CLP',
      orderId,
    })

    const basePath = Container.get(BASE_PATH_TOKEN) ?? ''
    console.log({ payment })
    return {
      id: orderId,
      link: `${basePath}/integration/${this.getName()}/internal/widgets/${
        payment.widget_token
      }`,
    }
  }

  async handleWebhookRequest(
    req: Request,
  ): Promise<{ id: string; name: string }> {
    this.log(req)

    return { id: '', name: '' }
  }

  async getInternalRoutes(name?: string) {
    const routes = {
      'widgets/:id': {
        handler: ({ params }) => {
          const { success, data, error } = validateSchema(
            z.object({ id: z.string() }),
            params,
          )
          if (!success)
            return {
              body: { error },
              headers: { 'Content-Type': 'application/json' },
            }

          const body = new Readable()
          body.push(`<!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Document</title>
            </head>
            <body>
              <p>example ${data.id}</p>
            </body>
          </html>
          `)
          body.push(null)

          return {
            body,
            headers: {
              'Content-Type': 'text/html',
            },
          }
        },
        method: HTTPMethod.GET,
      },
    } as const satisfies Record<
      string,
      { handler: PayscriptHandler; method: HTTPMethod }
    >
    return routes
  }

  protected getFintocLink(name?: string) {
    return getValueFrom(this.config.fintocLink, [name])
  }

  protected getAccessToken(name?: string) {
    return getValueFrom(this.config.accessToken, [name])
  }
}

export const createFintocIntegration = (
  config: FintocIntegrationConfig,
): typeof FintocIntegration => {
  @Service()
  class FintocIntegrationConfigured extends FintocIntegration {
    async onCreate() {
      this.config = config
      this.fintocService.loggerService = this.logService
    }
  }

  return FintocIntegrationConfigured
}
