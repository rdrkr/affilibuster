// Copyright (c) 2025 Affilibuster by Ronen Druker.

import * as eslint from '@eslint/js'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import jsdoc from 'eslint-plugin-jsdoc'
import { defineConfig } from 'eslint/config'
import * as tseslint from 'typescript-eslint'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      '.next/**',
      'coverage/**',
      'dist/**',
      'next-env.d.ts',
      'node_modules/**',
      'package-lock.json',
      'public/**',
      'src/lib/generated/**',
      'types/**',
      'postcss.config.mjs',
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
      'better-tailwindcss': betterTailwindcss,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/globals.css',
      },
    },
    rules: {
      // Use plugin's recommended-error config rules
      ...betterTailwindcss.configs['recommended-error']?.rules,
      // Override no-unknown-classes to add ignore list for legitimate non-Tailwind classes
      'better-tailwindcss/no-unknown-classes': [
        'error',
        {
          ignore: [
            'material-symbols-outlined', // Google Material Symbols font
            'material-symbols-outlined-bold', // Google Material Symbols font (bold)
            'scrollbar-hide', // Custom scrollbar utility
            'animate-fade-in-up', // Custom animation
            'text-shadow-shimmer', // Custom shimmer animation
            'text-shadow-sm', // Custom text shadow
            'text-shadow-base', // Custom text shadow
            'text-shadow-md', // Custom text shadow
            'text-shadow-lg', // Custom text shadow
            'text-shadow-xl', // Custom text shadow
            'text-shadow-2xl', // Custom text shadow
            'text-shadow-none', // Custom text shadow
            'drop-shadow-icon-sm', // Custom drop shadow for icons/images
            'prose', // Typography plugin
            'prose-invert', // Typography plugin
          ],
        },
      ],
      // handled by prettier
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
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
  eslintConfigPrettier, // must be last as per https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#eslint-config-prettier
])
