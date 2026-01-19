// Copyright (c) 2025 Affilibuster by Ronen Druker.

import * as eslintJs from '@eslint/js'
import type { ESLint } from 'eslint'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import jsdoc from 'eslint-plugin-jsdoc'
import { defineConfig } from 'eslint/config'
import * as tseslint from 'typescript-eslint'

export default defineConfig([
  // Next.js configs
  ...nextVitals,
  ...nextTs,

  // TypeScript configs
  {
    files: ['**/*.{js,mjs,ts,tsx,cts,mts}'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
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
  eslintJs.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      // handled by prettier
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // managed by our Image object
      'jsx-a11y/alt-text': 'off',
    },
  },

  // JSDoc configs
  jsdoc.configs['flat/recommended-typescript-error'],
  {
    plugins: {
      jsdoc,
    },
    rules: {},
  },

  // Tailwind CSS configs
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/globals.css',
      },
    },
    plugins: {
      'better-tailwindcss': eslintPluginBetterTailwindcss as unknown as ESLint.Plugin,
    },
    rules: {
      // Use plugin's recommended-error config rules
      ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,

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
    },
  },

  // Test configs
  {
    files: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'tests/**/*.ts', 'tests/**/*.tsx'],
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
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@next/next/no-img-element': 'off',
      // Override no-unknown-classes to add ignore list for legitimate non-Tailwind classes
      'better-tailwindcss/no-unknown-classes': [
        'error',
        {
          ignore: [
            'custom-class', // Test-specific
            'custom-icon', // Test-specific
            'custom-tag', // Test-specific
            'material-symbols-outlined',
            'material-symbols-outlined-bold',
            'scrollbar-hide',
            'animate-fade-in-up',
            'text-shadow-shimmer',
            'text-shadow-sm',
            'text-shadow-base',
            'text-shadow-md',
            'text-shadow-lg',
            'text-shadow-xl',
            'text-shadow-2xl',
            'text-shadow-none',
            'drop-shadow-icon-sm',
            'prose',
            'prose-invert',
          ],
        },
      ],
    },
  },

  // Prettier config
  eslintConfigPrettier, // must be last as per https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#eslint-config-prettier
])
