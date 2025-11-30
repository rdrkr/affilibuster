// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../contracts/affilibuster.openapi.yaml',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './src/lib/generated',
  },
  parser: {
    transforms: {
      enums: 'root',
    },
  },
  plugins: [
    {
      name: '@hey-api/typescript',
      enums: 'typescript',
    },
  ],
})
