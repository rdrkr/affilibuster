// Copyright (c) 2025 Affilibuster by Ronen Druker.
// Jest configuration for CMS testing
// Status: Ready for future use when custom Strapi code is added

// Note: Config type not imported because jest is not a CMS dependency
// This config is prepared for when custom Strapi code is added
const jestConfig = {
  // Test environment
  testEnvironment: 'node', // Node environment for Strapi (not jsdom)

  // Test discovery
  testPathIgnorePatterns: ['/node_modules/', '.tmp', '.cache'],
  testMatch: ['**/__tests__/**/*.[jt]s', '**/?(*.)+(spec|test).[jt]s'],

  // Coverage collection - EXCLUDE STRAPI BOILERPLATE
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.schema.{js,json}', // Exclude content type schemas
    '!src/**/routes/*.js', // Exclude route configurations
    '!src/**/index.js', // Exclude boilerplate index exports
  ],

  // Coverage thresholds - LOWER for CMS due to framework boilerplate
  // Note: Threshold lower than 80% is justified because:
  // 1. Most CMS code is Strapi framework boilerplate
  // 2. Framework code is already tested by Strapi team
  // 3. Only custom business logic should be tested
  coverageThreshold: {
    global: {
      branches: 60, // Lower than standard 80%
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Coverage reporters
  coverageReporters: ['lcov', 'json', 'html', 'text'],

  // Performance
  maxWorkers: '50%',
  cache: true,

  // Timeouts - Strapi can be slow to start
  testTimeout: 15000, // 15 seconds (higher than default 5s)
}

export default jestConfig
