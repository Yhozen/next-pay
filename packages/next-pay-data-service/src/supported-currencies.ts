export type SupportedCurrenciesType = 'USD' | 'CLP'

export const SupportedCurrencies = {
  USD: 'USD',
  CLP: 'CLP',
} as const satisfies Record<SupportedCurrenciesType, SupportedCurrenciesType>
