import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    MP_ACCESS_TOKEN: z.string().url(),
    FINTOC_ACCESS_TOKEN: z.string().url(),
    FINTOC_LINK_TOKEN: z.string().min(1),
  },
  experimental__runtimeEnv: {},
})
