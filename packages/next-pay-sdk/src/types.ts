import type { PayCore, NextPayIntegration } from 'next-pay-core'

import type {
  IntegrationsObjectBase,
  DefaultIntegrationsObject,
} from './integration-object'

type ValueOf<
  ObjectType,
  ValueType extends keyof ObjectType = keyof ObjectType,
> = ObjectType[ValueType]

export type GetSupportedCurrenciesResponse<
  Integrations extends IntegrationsObjectBase,
> = ValueOf<Integrations>['supportedCurrencies']

export type GetSupportedProviderForCurrencyResponse<
  Integrations extends IntegrationsObjectBase,
> = ReturnType<PayCore<Integrations>['getServicesByCurrency']>

export type ServiceProviders<
  Integrations extends IntegrationsObjectBase = DefaultIntegrationsObject,
> = keyof Integrations

export type SupportedCurrenciesForProvider<
  Integrations extends IntegrationsObjectBase,
  Provider extends ServiceProviders<Integrations>,
> = Integrations[Provider]['supportedCurrencies'][number]

export type RequestPaymentLinkResponse = Awaited<
  ReturnType<NextPayIntegration['createOrder']>
>
