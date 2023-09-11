import { NextPaySdk } from 'next-pay-sdk'

import type { IntegrationObject } from '../pages/api/next-pay/[...next-pay]'

export const sdk = new NextPaySdk<IntegrationObject>({
  apiURL: '/api/next-pay',
})
