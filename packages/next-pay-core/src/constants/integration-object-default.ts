import { NextPayIntegrationBase } from '../integrations/base.integration'

import { MercadoPagoIntegration } from '../integrations/mercadopago.integration'
import { PaypalIntegration } from '../integrations/paypal.integration'

const integrationsObject = {
  [PaypalIntegration.integrationName]: NextPayIntegrationBase,
  [MercadoPagoIntegration.integrationName]: NextPayIntegrationBase,
} as const satisfies Record<string, typeof NextPayIntegrationBase>

export type DefaultIntegrationsObject = typeof integrationsObject
export type IntegrationsObjectBase = Record<
  string,
  typeof NextPayIntegrationBase
>
