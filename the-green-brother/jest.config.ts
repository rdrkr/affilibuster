// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { createRequire } from 'node:module'

import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const esmRequire = createRequire(import.meta.url)
const { baseJestConfig } = esmRequire('../frontend/jest.config.base.cjs') as {
  baseJestConfig: Config
}

const createJestConfig = nextJest({
  dir: './',
})

/**
 * TheGreenBrother Jest configuration.
 * Extends the shared base config with app-specific coverage exclusions and thresholds.
 */
const customJestConfig: Config = {
  ...baseJestConfig,
  collectCoverageFrom: [
    ...(baseJestConfig.collectCoverageFrom ?? []),
    '!src/app/[lang]/style-guide/**',
    // Exclude re-export files for components now in @affilibuster/frontend
    '!src/components/elements/Breadcrumbs.tsx',
    '!src/components/elements/ButtonAction.tsx',
    '!src/components/elements/ButtonLink.tsx',
    '!src/components/elements/Card.tsx',
    '!src/components/elements/common.tsx',
    '!src/components/elements/ContributorCard.tsx',
    '!src/components/elements/DraftModeBanner.tsx',
    '!src/components/elements/DynamicTextBlock.tsx',
    '!src/components/elements/Header.tsx',
    '!src/components/elements/Icon.tsx',
    '!src/components/elements/Image.tsx',
    '!src/components/elements/ImageGallery.tsx',
    '!src/components/elements/imageUtils.ts',
    '!src/components/elements/index.ts',
    '!src/components/elements/Label.tsx',
    '!src/components/elements/ScrollableTableWrapper.tsx',
    '!src/components/elements/ShortcutsGrid.tsx',
    '!src/components/elements/Text.tsx',
    '!src/components/elements/TextBlock.tsx',
    '!src/components/layout/Carousel.tsx',
    '!src/components/layout/ContainerTabBar.tsx',
    '!src/components/layout/DynamicZone.tsx',
    '!src/components/layout/PageClient.tsx',
    '!src/components/layout/TabbedDynamicZone.tsx',
    '!src/components/layout/TabbedView.tsx',
    '!src/components/layout/tabbed-view-types.ts',
    '!src/components/layout/index.ts',
    '!src/components/sections/*.tsx',
    '!src/components/sections/index.ts',
    '!src/components/navigation/*.tsx',
    '!src/components/navigation/index.ts',
    '!src/components/footer/Footer.tsx',
    '!src/components/footer/index.ts',
    '!src/components/menus/*.tsx',
    '!src/components/menus/index.ts',
    '!src/components/seo/JsonLdScript.tsx',
    '!src/components/seo/index.ts',
    // Phase 6: hooks, providers, consent, themes, navigation re-exports
    '!src/hooks/useScrollToClose.ts',
    '!src/lib/themes/api.ts',
    '!src/lib/themes/useTheme.ts',
    '!src/lib/themes/index.ts',
    '!src/lib/consent/api.ts',
    '!src/lib/consent/types.ts',
    '!src/lib/consent/useConsent.ts',
    '!src/lib/consent/ssr.ts',
    '!src/lib/consent/index.ts',
    '!src/lib/navigation/useNavigationResize.ts',
    '!src/lib/navigation/index.ts',
    '!src/components/providers/*.tsx',
    '!src/components/providers/index.ts',
    '!src/components/consent/*.tsx',
    '!src/components/consent/index.ts',
    // Exclude middleware types (local copy of LanguageCode for Edge Runtime compatibility)
    '!src/lib/middleware-types.ts',
    // Exclude middleware and i18n config (tested via E2E)
    '!src/proxy.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 96,
      functions: 99,
      lines: 99,
      statements: 98,
    },
  },
}

export default createJestConfig(customJestConfig)
