import Container, { Inject, Service, Token } from 'typedi'
import { z } from 'zod'

import { Data } from 'next-pay-data-service'
import type { SupportedCurrenciesType } from '../constants/supported-currencies'
import type { HTTPMethod, PayscriptHandler } from 'helpers/routing.helpers'
import { IntegrationConfig } from '../services/integration-config.service'
import type { RequestInternal } from '../types/internal.types'
import { NextPayOrderStatus } from '../types/pay-order-status.type'
import { Logger } from '../services/logger.service'

const nameSchema = z
  .string()
  .min(2)
  .regex(/^[a-z0-9]+$/i)

export abstract class NextPayIntegrationBase {
  /**
   * Unique name that will be used for implementation routes
   */
  static readonly integrationName: string
  /**
   * List of currencies that implemention supports (usually only one)
   */
  static readonly supportedCurrencies: readonly SupportedCurrenciesType[]
  static create: () => NextPayIntegrationBase
}

@Service()
export abstract class NextPayIntegration extends NextPayIntegrationBase {
  name = ''

  /**
   * List of currencies that implemention supports (usually only one)
   */
  abstract readonly supportedCurrencies: readonly SupportedCurrenciesType[]

  @Inject()
  private readonly dataService!: Data
  @Inject()
  protected readonly logService!: Logger
  @Inject()
  private readonly integrationConfig!: IntegrationConfig

  /**
   * Instanciates implementation and validates its configuration
   */
  static async create() {
    const instance = Container.get(this as Token<NextPayIntegration>)

    instance.name = this.integrationName
    instance.logService.setName(instance.name)

    await instance.onCreate()

    // validate name
    nameSchema.parse(instance.getName())

    // return correct instance
    return instance
  }

  /**
   * Returns implementation name, which will be used in order to get implementation routes
   */
  getName() {
    return this.name
  }

  /**
   * Display in console
   */
  log(...args: unknown[]) {
    this.logService.log(...args)
  }

  /**
   * Function that runs after initialization
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onCreate(): void | Promise<void> {}

  abstract createPaymentRequest(
    amount: string,
    orderId: string,
    referenceId: string,
    name?: string,
  ): Promise<{ id: string; link: string }>

  /**
   * Check against the implemented service in which status the order is.
   *
   * Which ever status the service has must be map to either `APPROVED`, `PENDING` or `REJECTED`.
   */
  abstract getOrderStatus(
    orderId: string,
    name?: string,
  ): Promise<{ status: NextPayOrderStatus }>

  /**
   * Gets orderId from req, throws error if it can't find it or doesn't need to use it
   *
   */
  abstract handleWebhookRequest(
    req: Request,
    internalRequest: RequestInternal,
  ): Promise<{ id: string; name?: string }>

  async createOrder(
    amount: string,
    currency: SupportedCurrenciesType,
    referenceId: string,
    name?: string,
  ) {
    return await this.dataService.startTransaction(async session => {
      const order = await this.dataService.createOrder(
        {
          serviceName: this.getName(),
          externalId: 'not_set',
          clientName: name,
          referenceId,
          currency,
          amount,
        },
        session,
      )

      if (!order) throw new Error(`couldn't save order`)

      const docId = order.id.toString()
      const payment = await this.createPaymentRequest(
        amount,
        docId,
        referenceId,
        name,
      )

      await this.dataService.updateOrder(
        { id: docId },
        {
          externalId: payment.id,
        },
        session,
      )

      return payment
    })
  }

  /**
   * This function is triggered by the external service
   * i.e: via Paypal webhooks
   */
  async processPayment(orderId: string, name?: string) {
    const { status } = await this.getOrderStatus(orderId, name)

    switch (status) {
      case NextPayOrderStatus.APPROVED:
        return this.onApproved(orderId, name)
      case NextPayOrderStatus.REJECTED:
        return this.onRejected(orderId, name)
      default:
        return this.onPending(orderId, name)
    }
  }

  async getInternalRoutes(
    name?: string,
  ): Promise<
    Record<string, { handler: PayscriptHandler; method: HTTPMethod }>
  > {
    return {}
  }

  /**
   * @param id - Payment internal (next-pay) ID
   * @param clientName - Next-pay client name, useful if you have more than one integration per payment provider
   */
  protected async onApproved(id: string, clientName?: string) {
    this.log('calling registered APPROVED webhooks')
    await this.dataService.updateOrder(
      { id },
      {
        status: NextPayOrderStatus.APPROVED,
      },
    )
    try {
      this.dataService
        .getOrderById(id)
        .then(order =>
          this.integrationConfig.onApproved(this.getName(), order, clientName),
        )
        .catch(error => this.log('error from onApproved', error))
    } catch (error) {
      this.log('error on trycatch statement')
    }
  }

  /**
   * @param id - Payment internal (next-pay) ID
   * @param clientName - Next-pay client name, useful if you have more than one integration per payment provider
   */
  protected async onRejected(id: string, clientName?: string) {
    this.log('calling registered REJECTED webhooks')
    await this.dataService.updateOrder(
      { id },
      {
        status: NextPayOrderStatus.REJECTED,
      },
    )
    try {
      this.dataService
        .getOrderById(id)
        .then(order =>
          this.integrationConfig.onRejected(this.getName(), order, clientName),
        )
    } catch (error) {}
  }

  /**
   * @param id - Payment internal (next-pay) ID
   * @param clientName - Next-pay client name, useful if you have more than one integration per payment provider
   */
  protected async onPending(id: string, clientName?: string) {
    this.log('transaction still pending')
    try {
      this.dataService
        .getOrderById(id)
        .then(order =>
          this.integrationConfig.onPending(this.getName(), order, clientName),
        )
    } catch (error) {}
  }

  protected async getOrderByExternalId(externalId: string) {
    const order = await this.dataService.getOrderByExternalId(externalId)

    return order
  }
}
