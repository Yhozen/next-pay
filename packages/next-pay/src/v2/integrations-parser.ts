import { NextPayIntegration } from 'next-pay-core'
import { NamedIntegration } from './named-integration.type'

const getObject = <T extends string>(named: NamedIntegration<T>) => {
  return {
    [named.integrationName as T]: named,
  } as Record<T, typeof named>
}

export const integrationArrayToObject = <T extends readonly NamedIntegration[]>(
  values: T,
): IntegrationsAsObject<T> => {
  return values.reduce((acc, klass) => {
    const objectOne = getObject(klass)

    return { ...acc, ...objectOne }
  }, {} as any)
}

type IntegrationName<T> = T extends { integrationName: infer K extends string }
  ? K
  : never

type NextPayValuesRecord<T> = {
  [K in keyof T]-?: T[K] extends typeof NextPayIntegration ? K : never
}[keyof T]

export type IntegrationsAsObject<
  T extends readonly NamedIntegration<string>[],
> = {
  -readonly [P in NextPayValuesRecord<T> as IntegrationName<T[P]>]: T[P]
}
