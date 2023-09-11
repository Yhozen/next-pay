import type { CreatePreferencePayload } from 'mercadopago/models/preferences/create-payload.model'
import { Service } from 'typedi'

import { NextPayIntegration } from '../base.integration'
import { NextPayOrderStatus } from '../../types/pay-order-status.type'
import { SupportedCurrencies } from '../../constants/supported-currencies'

import {
  createMercadoPagoPaymentLink,
  getMercadoPagoPaymentData,
} from './service'
import type { MercadoPagoIntegrationConfig } from './config'
import { getValueFrom } from 'helpers/integration.helpers'
import { RequestInternal } from 'types/internal.types'

enum PaymentActions {
  CREATED = 'payment.created',
  UPDATED = 'payment.updated',
}

@Service()
export class MercadoPagoIntegration extends NextPayIntegration {
  static integrationName = 'mercadopago' as const
  config!: MercadoPagoIntegrationConfig

  static supportedCurrencies = [SupportedCurrencies.CLP] as const
  supportedCurrencies = MercadoPagoIntegration.supportedCurrencies

  async onCreate() {
    throw new Error("override MercadoPagoIntegration's onCreate method")
  }

  protected async onCreateWithConfig(config: MercadoPagoIntegrationConfig) {
    this.config = config
  }

  async createPaymentRequest(
    amount: string,
    orderId: string,
    referenceId: string,
    name?: string,
  ): Promise<{ id: string; link: string }> {
    const preference: CreatePreferencePayload = {
      items: [
        {
          title: 'NextPay',
          unit_price: Number(amount),
          quantity: 1,
        },
      ],
      external_reference: orderId,
      ...(this.config.back_urls
        ? { back_urls: await this.getBackUrls(referenceId) }
        : {}),
    }
    const accessToken = await this.getAccessToken(name)

    const mpResponse = await createMercadoPagoPaymentLink(
      preference,
      accessToken,
    )

    return mpResponse
  }

  async getOrderStatus(
    orderId: string,
    name?: string,
  ): Promise<{ status: NextPayOrderStatus; externalId: string }> {
    const accessToken = await this.getAccessToken(name)

    const paymentData = await getMercadoPagoPaymentData(
      Number(orderId),
      accessToken,
    )
    const externalId = paymentData.external_reference

    if (paymentData.status === 'approved')
      return { status: NextPayOrderStatus.APPROVED, externalId }

    if (paymentData.status === 'rejected')
      return { status: NextPayOrderStatus.REJECTED, externalId }

    return { status: NextPayOrderStatus.PENDING, externalId }
  }

  async handleWebhookRequest(
    req: Request,
    internalRequest: RequestInternal,
  ): Promise<{ id: string; name?: string }> {
    const body = internalRequest.body

    if (!body) throw new Error('Bad event')
    if (![PaymentActions.CREATED, PaymentActions.UPDATED].includes(body.action))
      throw new Error('Bad event: unknown actions')

    const id = body.data?.id as string | undefined

    if (!id) throw new Error('No id')

    const name = internalRequest.query?.clientName

    return { id, name }
  }

  async processPayment(orderId: string, name?: string) {
    const { status, externalId } = await this.getOrderStatus(orderId, name)

    switch (status) {
      case NextPayOrderStatus.APPROVED:
        return this.onApproved(externalId, name)
      case NextPayOrderStatus.REJECTED:
        return this.onRejected(externalId, name)
      default:
        return this.onPending(externalId, name)
    }
  }

  protected getAccessToken(name?: string) {
    const fn = this.config.accessToken ?? this.config.getMpAccessToken

    return getValueFrom(fn, [name])
  }

  protected getBackUrls(referenceId: string) {
    return getValueFrom(this.config.back_urls, [referenceId])
  }
}

export const createMercadoPagoIntegration = (
  config: MercadoPagoIntegrationConfig,
): typeof MercadoPagoIntegration => {
  @Service()
  class MercadoPagoIntegrationConfigured extends MercadoPagoIntegration {
    async onCreate() {
      return this.onCreateWithConfig(config)
    }
  }

  return MercadoPagoIntegrationConfigured
}
