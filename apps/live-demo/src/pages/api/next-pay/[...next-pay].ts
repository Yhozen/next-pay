import { prismaAdapter } from 'adapter-prisma'
import {
  createIntegrations,
  defineNextPayConfig,
  InferIntegrationType,
  NextPay,
} from 'next-pay'
import {
  createFintocIntegration,
  createMercadoPagoIntegration,
} from 'next-pay-core'

import { env } from '@/env/server'

import { prisma } from '../../../db/client'

const MercadoPagoIntegration = createMercadoPagoIntegration({
  async accessToken(): Promise<string> {
    return env.MP_ACCESS_TOKEN
  },
  back_urls: id => ({
    success: `${process.env.NEXTAUTH_URL}/someroute/${id}/successful`,
    failure: `${process.env.NEXTAUTH_URL}/someroute/${id}/rejected`,
    pending: `${process.env.NEXTAUTH_URL}/someroute/${id}/pending`,
  }),
})

const FintocIntegration = createFintocIntegration({
  accessToken: env.FINTOC_ACCESS_TOKEN,
  fintocLink: env.FINTOC_LINK_TOKEN,
})

const integrations = createIntegrations()
  .add(MercadoPagoIntegration)
  .add(FintocIntegration)
  .compile()

const nextPayConfig = defineNextPayConfig({
  integrations,
  name: 'live-demo',
  adapter: prismaAdapter(prisma),
  integrationConfig: {
    async onApproved(integrationName, order) {
      const invoiceId = order?.referenceId

      if (!invoiceId) return

      console.log({ invoiceId })
    },
    async onPending(integrationName, order) {
      const invoiceId = order?.referenceId

      if (!invoiceId) return

      console.log({ invoiceId })
    },

    async onRejected(integrationName, order) {
      const invoiceId = order?.referenceId

      if (!invoiceId) return

      console.log({ invoiceId })
    },
  },
})

export type IntegrationObject = InferIntegrationType<typeof nextPayConfig>

const { handler } = NextPay.create(nextPayConfig)

export default handler
