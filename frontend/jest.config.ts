// Copyright (c) 2025 Affilibuster by Ronen Druker.

import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/performance/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/lib/generated/**',
    // Server Components, middleware, and route handlers (covered by Playwright)
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/route.ts',
    '!src/proxy.ts',
    '!src/i18n.ts',
    '!src/i18n/**',
    '!src/config/**',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 97,
      lines: 100,
      statements: 99,
    },
  },
  coverageReporters: ['lcov', 'json', 'html'],
  maxWorkers: '50%',
  cache: true,
  moduleDirectories: ['node_modules', '<rootDir>/'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)
