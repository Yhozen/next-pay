import {
  createIntegrations,
  defineNextPayConfig,
  InferIntegrationType,
  NextPay,
} from "next-pay";
import {
  createMercadoPagoIntegration,
  mongoAdapter,
  connectMongo,
} from "next-pay-core";

const MercadoPagoIntegration = createMercadoPagoIntegration({
  async accessToken(): Promise<string> {
    return "YOUR_MERCADOPAGO_ACCESS_TOKEN";
  },
  back_urls: (id) => ({
    success: `${process.env.NEXTAUTH_URL}/someroute/${id}/successful`,
    failure: `${process.env.NEXTAUTH_URL}/someroute/${id}/rejected`,
    pending: `${process.env.NEXTAUTH_URL}/someroute/${id}/pending`,
  }),
});

const integrations = createIntegrations().add(MercadoPagoIntegration).compile();

const nextPayConfig = defineNextPayConfig({
  integrations,
  name: "live-demo",
  adapter: mongoAdapter({ connection: connectMongo }),
  integrationConfig: {
    async onApproved(integrationName, order) {
      const invoiceId = order?.referenceId;

      if (!invoiceId) return;

      console.log({ invoiceId });
    },
    async onPending(integrationName, order) {
      const invoiceId = order?.referenceId;

      if (!invoiceId) return;

      console.log({ invoiceId });
    },

    async onRejected(integrationName, order) {
      const invoiceId = order?.referenceId;

      if (!invoiceId) return;

      console.log({ invoiceId });
    },
  },
});

export type IntegrationObject = InferIntegrationType<typeof nextPayConfig>;

const { handler } = NextPay.create(nextPayConfig);

export default handler;
