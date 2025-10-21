// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'next-env.d.ts',
      'src/lib/generated/**',
      'package-lock.json',
    ],
  },
  { files: ['**/*.{js,mjs,ts,tsx}'] },
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
])
