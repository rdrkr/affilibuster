// Copyright (c) 2025 Affilibuster by Ronen Druker.

import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import jsdoc from 'eslint-plugin-jsdoc'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      'coverage/**',
      '.strapi/**',
      'types/**',
      'public/**',
      'package-lock.json',
    ],
  },
  { files: ['**/*.{js,mjs,ts,tsx,cts,mts}'] },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  jsdoc.configs['flat/recommended-typescript-error'],
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
    rules: {},
  },
  eslintConfigPrettier,
])
