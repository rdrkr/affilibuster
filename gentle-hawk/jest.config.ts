// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { createRequire } from 'node:module'

import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const esmRequire = createRequire(import.meta.url)
const { baseJestConfig } = esmRequire('../frontend/jest.config.base.cjs') as {
  baseJestConfig: Config
}

const createJestConfig = nextJest({
  dir: './',
})

/**
 * GentleHawk Jest configuration.
 * Extends the shared base config with app-specific coverage exclusions and thresholds.
 */
const customJestConfig: Config = {
  ...baseJestConfig,
  collectCoverageFrom: [
    ...(baseJestConfig.collectCoverageFrom ?? []),
    // Exclude re-export files for components from @affilibuster/frontend
    '!src/components/elements/**',
    '!src/components/layout/**',
    '!src/components/sections/**',
    '!src/components/navigation/**',
    '!src/components/footer/**',
    '!src/components/menus/**',
    '!src/components/seo/**',
    '!src/components/providers/**',
    '!src/components/consent/**',
    '!src/hooks/useScrollToClose.ts',
    '!src/lib/themes/**',
    '!src/lib/consent/**',
    '!src/lib/navigation/**',
    // Exclude server components (tested via E2E, not unit tests)
    '!src/app/**',
    // Exclude blog and product placeholders (not real implementations)
    '!src/components/blog/**',
    '!src/components/product/**',
    // SEO types have no logic (interfaces only)
    '!src/lib/seo/types.ts',
    // Exclude API types re-export (no logic)
    '!src/lib/core/api-types.ts',
    // Exclude middleware and i18n config (tested via E2E)
    '!src/i18n.ts',
    '!src/proxy.ts',
    // Exclude middleware types (local copy of LanguageCode for Edge Runtime compatibility)
    '!src/lib/middleware-types.ts',
    // Exclude barrel re-export index files (no logic)
    '!src/lib/content/index.ts',
    '!src/lib/core/index.ts',
    '!src/lib/languages/index.ts',
    '!src/components/homepage/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 99,
    },
  },
}

export default createJestConfig(customJestConfig)
