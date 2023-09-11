import { IntegrationsObjectBase } from '../constants/integration-object-default'
import { z } from 'zod'

import { SupportedCurrencies } from '../constants/supported-currencies'
import { HTTPMethod, PayscriptTrie } from '../helpers/routing.helpers'
import { PayCore } from '../core'
import {
  handleSchemaError,
  validateSchema,
} from '../helpers/validation.helpers'

const supportedCurrenciesSchema = z.nativeEnum(SupportedCurrencies)

const paramsSchema = z.object({ currency: supportedCurrenciesSchema })

export const addGeneralRoutesTrie = <
  Integrations extends IntegrationsObjectBase,
>(
  trie: PayscriptTrie,
  payCore: PayCore<Integrations>,
) => {
  trie
    .define(`/general/supported_currencies`)
    .handle(HTTPMethod.GET, async () => {
      const supportedCurrencies = payCore.getSupportedCurrencies()
      return {
        headers: { 'Content-Type': 'application/json' },
        body: supportedCurrencies,
      }
    })

  trie
    .define(`/general/supported_services/:currency`)
    .handle(HTTPMethod.GET, async ({ params }) => {
      const { success, data, error } = validateSchema(paramsSchema, params)
      if (!success) return handleSchemaError(error)

      const availableServices = payCore.getServicesByCurrency(data.currency)

      return {
        headers: { 'Content-Type': 'application/json' },
        body: availableServices,
      }
    })
}
