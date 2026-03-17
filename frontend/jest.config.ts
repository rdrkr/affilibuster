// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { Config } from 'jest'

/**
 * Jest configuration for the shared frontend package.
 * Uses SWC via @swc/jest for fast TypeScript/JSX transformation
 * (same transform engine as next/jest, without requiring app directory).
 */
const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@affilibuster/frontend/generated/(.*)$': '<rootDir>/src/lib/generated/$1',
    '^@affilibuster/frontend/(.*)$': '<rootDir>/src/$1',
    '^@affilibuster/frontend$': '<rootDir>/src/index.ts',
    'react-markdown': '<rootDir>/tests/mocks/react-markdown.tsx',
    'remark-gfm': '<rootDir>/tests/mocks/remark-gfm.ts',
    'rehype-raw': '<rootDir>/tests/mocks/rehype-raw.ts',
    'rehype-sanitize': '<rootDir>/tests/mocks/rehype-sanitize.ts',
    // Mock CSS/style imports
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/style-mock.ts',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/lib/generated/**',
    '!src/index.ts',
    // Components tested in app suites (TGB) due to app-specific imports
    '!src/components/elements/ImageGallery.tsx',
    '!src/components/footer/Footer.tsx',
    '!src/components/sections/BlogTeaserSection.tsx',
    '!src/components/sections/FeaturedProductsSection.tsx',
    '!src/components/sections/TeamSection.tsx',
    '!src/components/sections/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 99,
      lines: 99,
      statements: 98,
    },
  },
  coverageReporters: ['lcov', 'json', 'html'],
  maxWorkers: '50%',
  cache: true,
  moduleDirectories: ['node_modules', '<rootDir>/'],
}

export default config
