// Adds DOM matchers such as toBeInTheDocument() to Vitest's expect.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library only cleans up automatically with Vitest globals enabled,
// which this project doesn't use, so unmount after each test here.
afterEach(cleanup)
