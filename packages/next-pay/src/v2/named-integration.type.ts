import { NextPayIntegration } from 'next-pay-core'

export type NamedIntegration<T extends string = string> =
  typeof NextPayIntegration & {
    integrationName: T
  }
