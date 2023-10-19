import type { GetValueByName } from 'helpers/integration.helpers'

type BackUrls = {
  /** return URL in case of successful payment  */
  success?: string | undefined
  /** return URL in case of pending payment  */
  pending?: string | undefined
  /** return URL in case of failed payment  */
  failure?: string | undefined
}

type AccessTokenConfig =
  | {
      /**
       * @deprecated prefer accessToken
       */
      getMpAccessToken: GetValueByName
      /**
       * string or function that returns the Mercado Pago Access Token
       */
      accessToken?: undefined
    }
  | {
      /**
       * @deprecated prefer accessToken
       */
      getMpAccessToken?: undefined
      /**
       * string or function that returns the Mercado Pago Access Token
       */
      accessToken: string | GetValueByName
    }

export type MercadoPagoIntegrationConfig = AccessTokenConfig & {
  back_urls?: BackUrls | GetValueByName<BackUrls>
}
