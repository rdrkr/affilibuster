// Copyright (c) 2025 Affilibuster by Ronen Druker.

import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.strapi/**', 'types/**', 'public/**', 'package-lock.json'],
  },
  { files: ['**/*.{js,mjs,ts,tsx}'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  prettier,
])
