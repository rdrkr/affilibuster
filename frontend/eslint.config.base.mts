// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Shared ESLint configuration for all Affilibuster frontend applications.
 * Each app's eslint.config.mts should call createAppEslintConfig() with its dirname.
 */

import * as eslintJs from '@eslint/js'
import type { ESLint } from 'eslint'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import jsdoc from 'eslint-plugin-jsdoc'
import { defineConfig } from 'eslint/config'
import * as tseslint from 'typescript-eslint'

/**
 * Shared list of non-Tailwind CSS classes that should not trigger linting errors.
 */
const sharedIgnoredClasses = [
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
  'skeleton',
  'accent',
  'foreground',
  'caret-caret',
  'selection:bg-selection',
  'selection:text-selection-foreground',
]

/**
 * Shared list of non-Tailwind CSS classes allowed only in test files.
 */
const testOnlyIgnoredClasses = ['custom-class', 'custom-icon', 'custom-tag']

/**
 * Create the full ESLint config for a frontend app.
 * @param appDirname - The app's directory (`import.meta.dirname`)
 * @returns Complete ESLint flat config array via defineConfig
 */
export function createAppEslintConfig(appDirname: string) {
  return defineConfig([
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
          projectService: {
            allowDefaultProject: ['src/lib/others/*.js'],
            defaultProject: './tsconfig.json',
          },
          tsconfigRootDir: appDirname,
        },
      },
    },
    {
      ignores: [
        '.next/**',
        'coverage/**',
        'dist/**',
        'frontend/**',
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
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
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
        ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
        'better-tailwindcss/no-unknown-classes': [
          'error',
          {
            ignore: sharedIgnoredClasses,
          },
        ],
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
        'better-tailwindcss/no-unknown-classes': [
          'error',
          {
            ignore: [...testOnlyIgnoredClasses, ...sharedIgnoredClasses],
          },
        ],
      },
    },

    // Prettier config (must be last)
    eslintConfigPrettier,
  ])
}
