// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * ESLint configuration for TheGreenBrother.
 * Uses the shared base config from `@affilibuster/frontend`.
 */

// @ts-expect-error — .mts extension import requires allowImportingTsExtensions but ESLint resolves it correctly
import { createAppEslintConfig } from '../frontend/eslint.config.base.mts'

export default createAppEslintConfig(import.meta.dirname)
