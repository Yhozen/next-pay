import type { SupportedCurrenciesType } from 'next-pay-core'

export const SupportedCurrencies = {
  USD: 'USD',
  CLP: 'CLP',
} as const satisfies Record<SupportedCurrenciesType, SupportedCurrenciesType>

type _SupportedCurrencies = typeof SupportedCurrencies

export type SupportedCurrencies = keyof _SupportedCurrencies
