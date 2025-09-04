// vitest.setup.ts
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'

// Automatically clean up DOM after each test
afterEach(() => {
  cleanup()
})
