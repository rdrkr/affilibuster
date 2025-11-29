// Copyright (c) 2025 Affilibuster by Ronen Druker.

import * as eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import * as tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      '.next/**',
      '.strapi/**',
      'coverage/**',
      'dist/**',
      'next-env.d.ts',
      'node_modules/**',
      'package-lock.json',
      'public/**',
      'src/lib/generated/**',
      'types/**',
      // Config files not in tsconfig.json project
      'postcss.config.mjs',
    ],
  },
  { files: ['**/*.{js,mjs,ts,tsx}'] },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    plugins: {
      jsdoc,
    },
    rules: {
      /**
       * Disable @typescript-eslint/unified-signatures due to a bug in typescript-eslint 8.46.2
       * where the rule crashes with "typeParameters.params is not iterable"
       * when analyzing certain generic type parameter patterns.
       * This is a known issue in the linter itself, not in the code quality.
       * The codebase maintains proper function signature practices.
       * @see https://github.com/typescript-eslint/typescript-eslint/issues
       */
      '@typescript-eslint/unified-signatures': 'off',

      // Stricter type checking
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': 'error',

      // Additional strictness
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Often too strict
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },
  // Relaxed rules for unit tests (Jest mocking limitations)
  {
    files: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Disable problematic rule for api-types.ts (causes stack overflow on large union types)
  {
    files: ['src/lib/core/api-types.ts'],
    rules: {
      '@typescript-eslint/no-redundant-type-constituents': 'off',
    },
  },
  // Relaxed rules for E2E and performance tests (Playwright API limitations)
  {
    files: ['tests/e2e/**/*.ts', 'tests/performance/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/await-thenable': 'off',

      // JSDoc Documentation Requirements
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
          contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration'],
          publicOnly: true,
          exemptEmptyFunctions: false,
        },
      ],
      'jsdoc/require-description': ['error', { contexts: ['any'] }],
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-param-type': 'off', // TypeScript provides types
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-returns-type': 'off', // TypeScript provides types
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': 'off', // TypeScript handles types
      'jsdoc/no-undefined-types': 'off', // TypeScript handles types
      'jsdoc/valid-types': 'off', // TypeScript handles types
      'jsdoc/require-example': 'off', // Optional - can enable for stricter docs
    },
  },
  prettier,
])
