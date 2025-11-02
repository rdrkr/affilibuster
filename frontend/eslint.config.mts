// Copyright (c) 2025 Affilibuster by Ronen Druker.

import * as eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import * as tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default defineConfig([
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
    ],
  },
  { files: ['**/*.{js,mjs,ts,tsx}'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  {
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
    },
  },
  prettier,
])
