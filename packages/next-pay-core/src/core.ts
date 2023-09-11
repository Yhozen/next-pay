import Container from 'typedi'

import { IntegrationsObjectBase } from './constants/integration-object-default'
import type { SupportedCurrenciesType } from './constants/supported-currencies'
import { PayscriptTrie } from './helpers/routing.helpers'
import { NextPayIntegration } from './integrations/base.integration'
import { addGeneralRoutesTrie } from './routes/general-routes'
import { addIntegrationRoutesTrie } from './routes/integration-routes'
import { Data, DataService } from './services/data.service'
import { IntegrationConfig } from './services/integration-config.service'
import { processRequest } from './processRequest'

type ValueOf<
  ObjectType,
  ValueType extends keyof ObjectType = keyof ObjectType,
> = ObjectType[ValueType]

type SupportedCurrenciesForIntegrations<
  Integrations extends IntegrationsObjectBase,
> = ValueOf<Integrations>['supportedCurrencies'][number]

export type Options = {
  integrations: (typeof NextPayIntegration)[]
  basePath?: string
  integrationConfig?: IntegrationConfig
  adapter: DataService
}

export class PayCore<Integrations extends IntegrationsObjectBase> {
  private trie = new PayscriptTrie()
  private initialized: Promise<void>
  supportedCurrenciesMap = new Map<
    SupportedCurrenciesForIntegrations<Integrations>,
    Map<string, boolean>
  >()
  integrations: Required<Options['integrations']>

  constructor(private readonly options: Options) {
    const integrationConfig = options.integrationConfig
    Container.set(Data, options.adapter.create())

    if (integrationConfig) {
      Container.set(IntegrationConfig, integrationConfig)
    }

    this.integrations = this.options.integrations ?? []
    this.initialized = this.initIntegrations()
  }

  static init(options: Options) {
    return new PayCore(options)
  }

  processRequest = async (request: Request) => {
    await this.initialized
    return processRequest(request, this.trie, {
      basePath: this.options.basePath,
    })
  }

  private async initIntegrations() {
    const promises = this.integrations.map(async integration => {
      const integrationInstance = await integration.create()

      await this.addIntegration(integrationInstance)

      integrationInstance.supportedCurrencies.forEach(currency =>
        this.addSupportedCurrencyByIntegration(
          currency,
          integrationInstance.getName(),
        ),
      )
    })

    await Promise.all(promises)
    this.printSupportedCurrencies()

    this.addGeneralIntegrations()

    this.printSupportedCurrencies()
  }

  private async addIntegration(integration: NextPayIntegration) {
    integration.log('Integrating...')

    return addIntegrationRoutesTrie(this.trie, integration)
  }

  private addGeneralIntegrations() {
    return addGeneralRoutesTrie(this.trie, this)
  }
  private addSupportedCurrencyByIntegration(
    currency: SupportedCurrenciesType,
    name: string,
  ) {
    if (!this.supportedCurrenciesMap.has(currency))
      this.supportedCurrenciesMap.set(currency, new Map())

    const currencyMap = this.supportedCurrenciesMap.get(currency)

    if (!currencyMap) return
    currencyMap.set(name, true)
  }

  private printSupportedCurrencies() {
    for (const [
      currency,
      currencyMap,
    ] of this.supportedCurrenciesMap.entries()) {
      console.log('Currency', currency, 'supported by: ')

      for (const [name] of currencyMap.entries()) console.log(name)
    }
  }

  getSupportedCurrencies = () => {
    return [...this.supportedCurrenciesMap.entries()].map(([name]) => name)
  }

  getServicesByCurrency = (currency: SupportedCurrenciesType) => {
    const currencyMap = this.supportedCurrenciesMap.get(currency)

    if (!currencyMap) return []

    return [...currencyMap.entries()].map(([name]) => name)
  }
}
