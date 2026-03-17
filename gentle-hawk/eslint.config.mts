// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * ESLint configuration for GentleHawk.
 * Uses the shared base config from `@affilibuster/frontend`.
 */

// @ts-expect-error — .mts extension import requires allowImportingTsExtensions but ESLint resolves it correctly
import { createAppEslintConfig } from '../frontend/eslint.config.base.mts'

export default createAppEslintConfig(import.meta.dirname)
