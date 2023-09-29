import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  dts: true,
  format: ['esm', 'cjs'],
  target: 'node18',
  loader: {
    '.html': 'text',
  },
  noExternal: ['fintoc-html'],
})
