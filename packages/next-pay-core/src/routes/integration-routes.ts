import { HTTPMethod, PayscriptTrie } from 'helpers/routing.helpers'
import { handleSchemaError, validateSchema } from 'helpers/validation.helpers'
import { z } from 'zod'

import { NextPayIntegration } from '../integrations/base.integration'
import {
  SupportedCurrencies,
  SupportedCurrenciesType,
} from '../constants/supported-currencies'

const requestBody = z.object({
  amount: z.number().or(z.string()),
  currency: z.nativeEnum(SupportedCurrencies),
  name: z.string().optional(),
  referenceId: z.string(),
})

export const addIntegrationRoutesTrie = async (
  trie: PayscriptTrie,
  integration: NextPayIntegration,
) => {
  const integrationName = integration.getName()
  const internalRoutesPromise = integration.getInternalRoutes()
  trie
    .define(`/integration/${integrationName}/create_request`)
    .handle(HTTPMethod.POST, async ctx => {
      console.log(ctx.params)
      const { success, data, error } = validateSchema(requestBody, ctx.req.body)

      if (!success) return handleSchemaError(error)

      const body = data

      const { amount, currency, name, referenceId } = body

      const order = await integration.createOrder(
        amount as string,
        currency as SupportedCurrenciesType,
        referenceId,
        name,
      )

      return {
        headers: { 'Content-Type': 'application/json' },
        body: order,
      }
    })

  trie
    .define(`/integration/${integration.getName()}/webhook`)
    .handle(HTTPMethod.POST, async ({ originalRequest, req }) => {
      try {
        const { id, name } = await integration.handleWebhookRequest(
          originalRequest,
          req,
        )

        await integration.processPayment(id, name)
      } catch (error) {
        integration.log(error)
      } finally {
        return {
          headers: { 'Content-Type': 'application/json' },
          body: {},
        }
      }
    })

  const internalRoutes = await internalRoutesPromise
  for (const internalRoutePath in internalRoutes) {
    const routeConfig = internalRoutes[internalRoutePath]
    if (!routeConfig) continue

    const { handler, method } = routeConfig
    trie
      .define(`/integration/${integrationName}/internal/${internalRoutePath}`)
      .handle(method, handler)
  }
  integration.log('did integrate')
}
