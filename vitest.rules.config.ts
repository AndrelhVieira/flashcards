import { defineConfig } from 'vitest/config'

// Testes das regras do Firestore; rodam contra o emulador (npm run test:rules).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.rules.test.ts'],
    testTimeout: 15_000,
  },
})
