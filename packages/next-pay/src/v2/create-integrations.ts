import type { NamedIntegration } from './named-integration.type'

type IntegrationsBuilder<
  T extends readonly NamedIntegration[] = readonly NamedIntegration[],
> = {
  compile(): T
  add<A extends NamedIntegration>(n: A): IntegrationsBuilder<readonly [...T, A]>
}

export const createIntegrations = () => {
  const initial = [] as const
  return new (class implements IntegrationsBuilder {
    private integrations = initial

    add<T extends NamedIntegration>(n: T) {
      const integrations = [...this.integrations, n] as const
      this.integrations = integrations as unknown as []

      return this as unknown as IntegrationsBuilder<typeof integrations>
    }

    compile() {
      return this.integrations
    }
  })() as IntegrationsBuilder<typeof initial>
}
