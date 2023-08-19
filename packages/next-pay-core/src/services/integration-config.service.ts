import type { SupportedCurrenciesType } from '../constants/supported-currencies'
import { Service } from 'typedi'

export type Order = {
  externalId: string
  serviceName: string
  currency: SupportedCurrenciesType
  amount: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  clientName?: string
  referenceId: string
}

// TO-DO: change OrderClass
@Service()
export class IntegrationConfig {
  /**
   * Executes right after updating the payment status on APPROVED payments
   * @param integrationName - i.e: PAYPAL, MERCADOPAGO
   * @param id - Payment internal (next-pay)
   * @param clientName - Next-pay client name, useful if you have more than one integration per payment provider
   */
  onApproved(
    integrationName: string,
    order?: Order | null,
    clientName?: string,
  ): Promise<void> | void {}

  /**
   * Executes right after updating the payment status on REJECTED payments
   * @param integrationName - i.e: PAYPAL, MERCADOPAGO
   * @param id - Payment internal (next-pay)
   * @param clientName - Next-pay client name, useful if you have more than one integration per payment provider
   */
  onRejected(
    integrationName: string,
    order?: Order | null,
    clientName?: string,
  ): Promise<void> | void {}
  /**
   * Executes right after updating the payment status on PENDING payments
   * @param integrationName - i.e: PAYPAL, MERCADOPAGO
   * @param id - Payment internal (next-pay)
   * @param clientName - Next-pay client name, useful if you have more than one integration per payment provider
   */
  onPending(
    integrationName: string,
    order?: Order | null,
    clientName?: string,
  ): Promise<void> | void {}
}
