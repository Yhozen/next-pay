import { Service } from 'typedi'

import { NextPayIntegration } from '../base.integration'
import { NextPayOrderStatus } from '../../types/pay-order-status.type'
import { SupportedCurrencies } from '../../constants/supported-currencies'
import { FintocIntegrationConfig } from './config'
import { getValueFrom } from '../../helpers/integration.helpers'
import * as fintocService from './service'

@Service()
export class FintocIntegration extends NextPayIntegration {
  static integrationName = 'fintoc' as const

  static supportedCurrencies = [SupportedCurrencies.CLP] as const
  supportedCurrencies = FintocIntegration.supportedCurrencies

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

  async createPaymentRequest(amount: string, orderId: string, name?: string) {
    const secretKey = await this.getAccessToken(name)

    const payment = await fintocService.createPayment({
      secretKey,
      amount: Number(amount),
      currency: 'CLP',
      orderId,
    })

    console.log({ payment })
    return { id: orderId, link: orderId }
  }

  async handleWebhookRequest(
    req: Request,
  ): Promise<{ id: string; name: string }> {
    this.log(req)

    return { id: '', name: '' }
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
    }
  }

  return FintocIntegrationConfigured
}
