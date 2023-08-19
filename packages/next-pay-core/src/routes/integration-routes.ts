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

export const addIntegrationRoutesTrie = (
  trie: PayscriptTrie,
  integration: NextPayIntegration,
) => {
  trie
    .define(`/integration/${integration.getName()}/create_request`)
    .handle(HTTPMethod.POST, async ctx => {
      console.log(ctx.params)
      const { success, data, error } = validateSchema(requestBody, ctx.req.body)

      if (!success) return handleSchemaError(error)

      const body = data

      const { amount, currency, name, referenceId } = body
      console.log({ name })

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
  integration.log('did integrate')
}
