import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type {
  IntegrationsObjectBase,
  DefaultIntegrationsObject,
} from './integration-object'

import type { SupportedCurrencies } from './supported-currencies'
export * from './supported-currencies'

import type {
  GetSupportedCurrenciesResponse,
  GetSupportedProviderForCurrencyResponse,
  RequestPaymentLinkResponse,
  ServiceProviders as SDKServiceProviders,
  SupportedCurrenciesForProvider,
} from './types'

type NextPaySdkOptions = {
  apiURL: string
  axiosOptions?: AxiosRequestConfig
}

export class NextPaySdk<
  Integrations extends IntegrationsObjectBase = DefaultIntegrationsObject,
> {
  axios: AxiosInstance
  constructor(options: NextPaySdkOptions) {
    this.axios = axios.create({
      ...(options.axiosOptions ?? {}),
      baseURL: options.apiURL,
    })
  }

  getSupportedCurrencies = async () => {
    const response = await this.axios.get<
      GetSupportedCurrenciesResponse<Integrations>
    >('/general/supported_currencies')

    return response.data
  }

  getSupportedProviderForCurrency = async (currency: SupportedCurrencies) => {
    const response = await this.axios.get<
      GetSupportedProviderForCurrencyResponse<Integrations>
    >(`/general/supported_services/${currency}`)

    return response.data
  }

  requestPaymentLink = async <
    Provider extends SDKServiceProviders<Integrations>,
  >({
    service,
    selectedCurrency,
    amount,
    referenceId,
    name,
  }: {
    service: Provider
    selectedCurrency: SupportedCurrenciesForProvider<Integrations, Provider>
    amount: string | number
    referenceId: string
    name?: string
  }) => {
    const serviceString = String(service)
    const response = await this.axios.post<RequestPaymentLinkResponse>(
      `/integration/${serviceString}/create_request`,
      {
        currency: selectedCurrency,
        amount,
        referenceId,
        name,
      },
    )

    return response.data
  }
}

export type ServiceProviders = SDKServiceProviders
