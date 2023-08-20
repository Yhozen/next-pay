import { Inject, Service } from 'typedi'

import { NextPayIntegration } from './base.integration'
import { NextPayOrderStatus } from '../types/pay-order-status.type'
import { SupportedCurrencies } from '../constants/supported-currencies'

@Service()
class ExampleDep {
  create() {
    console.log('creating....')
  }
}

@Service()
export class PaypalIntegration extends NextPayIntegration {
  static integrationName = 'paypal' as const

  static supportedCurrencies = [SupportedCurrencies.USD] as const
  supportedCurrencies = PaypalIntegration.supportedCurrencies

  @Inject()
  private extraInjection!: ExampleDep

  /*
  private axios!: AxiosInstance

  onCreate(): void {
    this.axios = axios.create({

    })
  }
*/

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

  async createPaymentRequest(amount: string, orderId: string) {
    this.extraInjection.create()

    return { id: orderId, link: orderId }
  }

  async handleWebhookRequest(req: Request): Promise<{ id: string }> {
    this.log(req)

    return { id: '' }
  }
}
