import { SupportedCurrencies } from './supported-currencies'
import type { DefaultIntegrationsObject as ImplementationDefaultIntegrationsObject } from 'next-pay-core'

abstract class NextPayIntegrationBase {
  /**
   * Unique name that will be used for implementation routes
   */
  static readonly integrationName: string
  /**
   * List of currencies that implemention supports (usually only one)
   */
  static readonly supportedCurrencies: readonly SupportedCurrencies[]
  static create: () => Promise<NextPayIntegrationBase>
}

class MercadoPagoIntegration extends NextPayIntegrationBase {
  static integrationName: 'mercadopago'
  static supportedCurrencies = [SupportedCurrencies.CLP] as const
}

class PaypalIntegration extends NextPayIntegrationBase {
  static integrationName: 'paypal'
  static supportedCurrencies = [SupportedCurrencies.USD] as const
}

export type IntegrationsObjectBase = Record<
  string,
  typeof NextPayIntegrationBase
>

export const defaultIntegrationsObject = {
  [PaypalIntegration.integrationName]: PaypalIntegration,
  [MercadoPagoIntegration.integrationName]: MercadoPagoIntegration,
} as const satisfies ImplementationDefaultIntegrationsObject

export type DefaultIntegrationsObject = typeof defaultIntegrationsObject
