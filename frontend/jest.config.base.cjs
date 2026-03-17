// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Shared Jest configuration for all Affilibuster frontend applications.
 * Each app's jest.config.ts should spread this base config and add
 * app-specific overrides (rootDir, coverage exclusions, thresholds).
 *
 * Plain JS (not TS) so it can be imported without .ts extension issues in tsc.
 *
 * @type {import('jest').Config}
 */
const baseJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@affilibuster/frontend/generated/(.*)$': '<rootDir>/../frontend/src/lib/generated/$1',
    '^@affilibuster/frontend/(.*)$': '<rootDir>/../frontend/src/$1',
    '^@affilibuster/frontend$': '<rootDir>/../frontend/src/index.ts',
    // Force single instances: resolve from app's node_modules, not frontend's.
    // Only map bare imports and specific subpaths (not wildcard) to avoid breaking package exports.
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
    '^next/navigation$': '<rootDir>/node_modules/next/navigation.js',
    '^next/dynamic$': '<rootDir>/node_modules/next/dynamic.js',
    '^next/image$': '<rootDir>/node_modules/next/image.js',
    'react-markdown': '<rootDir>/../frontend/tests/mocks/react-markdown.tsx',
    'remark-gfm': '<rootDir>/../frontend/tests/mocks/remark-gfm.ts',
    'rehype-raw': '<rootDir>/../frontend/tests/mocks/rehype-raw.ts',
    'rehype-sanitize': '<rootDir>/../frontend/tests/mocks/rehype-sanitize.ts',
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
  ],
  coverageReporters: ['lcov', 'json', 'html'],
  maxWorkers: '50%',
  cache: true,
  moduleDirectories: ['node_modules', '<rootDir>/'],
}

module.exports = { baseJestConfig }
