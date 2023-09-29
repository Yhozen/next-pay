import { createEnv } from '@t3-oss/env-nextjs'

export const env = createEnv({
  client: {
    // NEXT_PUBLIC_PUBLISHABLE_KEY: z.string(),
  },
  experimental__runtimeEnv: {
    //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
})
