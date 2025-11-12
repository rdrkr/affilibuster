# Implementation Plan: E2E Test Coverage Completion

**Branch**: `005-e2e-test-coverage` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)

## Summary

Fix 54 failing E2E tests (out of 108 total, 50% pass rate) by:
1. Fixing URL routing bugs in product navigation
2. Implementing Next.js sitemap generation using official API
3. Fixing accessibility violations (WCAG 2.1 AA)
4. Implementing 301 redirects and 410 Gone pages
5. Optimizing performance (page load, lazy loading, bundling)
6. Implementing schema markup (Schema.org JSON-LD)
7. Fixing SEO meta tags and hreflang
8. Fixing 404 page metadata issues

This will achieve 100% E2E test pass rate (108/108 tests passing) while maintaining 100% unit test coverage and following Clean Architecture principles.

## Technical Context

**Language/Version**: TypeScript 5.7+ (frontend), Python 3.13+ (backend - if needed)
**Primary Dependencies**: React 19, Next.js 16, Tailwind CSS 4, Playwright
**Testing**: Jest + React Testing Library (unit), Playwright (E2E)
**Target Platform**: Web application (responsive, mobile-first)
**Performance Goals**: Maintain <3s page load on 3G, no degradation from new features
**Constraints**:
  - Must maintain 100% test coverage
  - All components must support i18n (en, it, he) and RTL
  - Must use Tailwind design tokens only
  - All new components must appear in style guide
**Scale/Scope**:
  - 9-12 test ID additions (non-breaking changes)
  - 4-5 new components (LanguagePrompt, RelatedProducts, Pagination, CategoryFilter)
  - 2-3 new backend API endpoints (if needed for related products/filtering)
  - Estimated 8-12 hours total

## Constitution Check

### ✅ I. Clean Architecture
- **Compliance**: Frontend components use hooks for data fetching, no direct backend coupling
- **Verification**: Components receive data via props, hooks handle API calls
- **Status**: PASS - Frontend follows component-based architecture with clear separation

### ✅ II. SOLID Principles
- **S (Single Responsibility)**: Each component has one clear purpose (e.g., LanguagePrompt handles only language detection UI)
- **O (Open/Closed)**: Components accept props for customization, closed to modification
- **L (Liskov Substitution)**: React component composition allows substitution
- **I (Interface Segregation)**: TypeScript interfaces define minimal required props
- **D (Dependency Inversion)**: Components depend on prop interfaces, not concrete implementations
- **Status**: PASS - Design follows SOLID principles

### ✅ III. Strongly Typed
- **Frontend**: All components, hooks, and utils have explicit TypeScript types
- **Props**: All component props defined with TypeScript interfaces
- **API Responses**: Use generated types from OpenAPI spec
- **No `any` Types**: Forbidden in TypeScript strict mode
- **Status**: PASS - Strong typing enforced throughout

### ✅ IV. Test-First Development (TDD)
- **Approach**: Write unit tests for new components BEFORE implementation
- **Process**: Red (failing test) → Green (minimal implementation) → Refactor
- **Coverage Target**: 100% (lines, branches, functions, statements)
- **E2E Verification**: E2E tests already exist and are failing - they guide implementation
- **Status**: PASS - E2E tests are already written (TDD by default), unit tests will follow TDD

### ✅ V. Modular & Reusable Architecture
- **Design**: All new components are generic and reusable
- **Style Guide**: All components registered in `/[lang]/style-guide`
- **Configuration**: Language/category data comes from CMS/API, not hard-coded
- **Status**: PASS - Components follow DRY and reusability principles

### ✅ VI. Integration Testing Priority
- **Coverage**: E2E tests cover integration between components and API
- **Critical Flows**: Language switching, product navigation, filtering
- **Component Integration**: Tests verify components work together correctly
- **Status**: PASS - E2E tests provide comprehensive integration testing

### ✅ VII. API-First Design
- **Approach**: Use existing API endpoints where possible
- **New Endpoints**: Define in OpenAPI spec before implementation (if needed)
- **Contract**: Follow existing API patterns in `contracts/template.openapi.yaml`
- **Status**: PASS - API-first approach for any new backend needs

### ✅ VIII. Performance & SEO Standards
- **Performance**: No new blocking operations, maintain <3s page load
- **Optimization**: Lazy load components where appropriate
- **SEO**: Related products improve internal linking (SEO benefit)
- **Status**: PASS - Performance targets maintained

## Implementation Phases

### Phase 1: Fix URL Routing Bugs (7 tests - Content Navigation)

**Goal**: Fix product navigation routing to match test expectations
**Estimated Time**: 1-2 hours
**Expected Outcome**: 61/108 tests passing (56% pass rate)

#### Root Cause:
Tests expect URLs like `/products/:slug` and `/:lang/products` but the application may have incorrect routing configuration.

#### Tasks:

1. **Investigate product routing structure**
   - Check `src/app/[lang]/[slug]/page.tsx` dynamic route
   - Verify slug resolution logic matches tests
   - Check if product URLs should be `/:lang/:slug` or `/:lang/products/:slug`

2. **Fix product detail page routing**
   - Ensure `/en/smart-fitness-watch` resolves correctly (not `/en/products/smart-fitness-watch`)
   - Update dynamic route handler if needed
   - Verify slug-to-product mapping works

3. **Fix products listing page**
   - Ensure `/en/products` route exists and works
   - Add pagination support (`?page=2`)
   - Add category filter support (`?category=electronics`)

4. **Fix breadcrumb navigation**
   - Ensure breadcrumb test IDs exist: `breadcrumb`, `breadcrumb-home`
   - Verify breadcrumb appears on product pages
   - Test navigation back to homepage

5. **Add missing test IDs**
   - `data-testid="product-title"` on product detail page
   - `data-testid="product-card"` on product listings
   - `data-testid="category-filter"` and `data-testid="category-electronics"`
   - `data-testid="pagination-next"` and `data-testid="pagination-prev"`
   - `data-testid="related-products"` and `data-testid="related-product"`

6. **Run content-navigation.spec.ts to verify** all 7 tests pass

### Phase 2: Implement Next.js Sitemap Generation (5 tests - Sitemap)

**Goal**: Implement sitemap using Next.js official `generateSitemaps()` API
**Estimated Time**: 1-2 hours
**Expected Outcome**: 66/108 tests passing (61% pass rate)

#### Reference:
- Next.js Docs: https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
- Test Suite: `sitemap.spec.ts`

#### Tasks:

1. **Create `sitemap.ts` route handler**
   - Location: `src/app/sitemap.ts`
   - Implement `generateSitemaps()` function to return language-specific sitemaps
   - Return sitemap index with links to language-specific sitemaps

2. **Implement sitemap generation logic**
   - Fetch all products, pages, and routes from CMS
   - Generate URLs for all languages (en, it, he)
   - Include `<xhtml:link>` tags for alternate languages (hreflang)
   - Add `changefreq` and `priority` based on content type
   - Add `lastmod` timestamps

3. **Generate language-specific sitemaps**
   - `/sitemap/en.xml` - All English URLs
   - `/sitemap/it.xml` - All Italian URLs
   - `/sitemap/he.xml` - All Hebrew URLs

4. **Sitemap index for large sites**
   - Generate `/sitemap_index.xml` if needed (>50,000 URLs)
   - Link to individual language sitemaps

5. **Run sitemap.spec.ts to verify** all 5 tests pass

### Phase 3: Implement Schema.org Markup (7 tests - Schema Markup)

**Goal**: Add JSON-LD schema markup for SEO
**Estimated Time**: 2-3 hours
**Expected Outcome**: 73/108 tests passing (68% pass rate)

#### Test Suite: `schema-markup.spec.ts`

#### Tasks:

1. **Create `SchemaMarkup.tsx` component**
   - Generic component to render JSON-LD script tags
   - Accept schema object as prop
   - Add to `<head>` via Next.js Metadata API or Script component

2. **Implement Organization schema** (homepage)
   - Organization name, logo, social profiles
   - Contact information
   - Same-as links (Twitter, Facebook)

3. **Implement Product schema** (product pages)
   - Product name, description, image
   - Offers with multiple currencies
   - AggregateRating if reviews exist
   - Brand, SKU, availability

4. **Implement BreadcrumbList schema** (all pages)
   - Breadcrumb navigation for SEO
   - Position-based hierarchy

5. **Implement WebPage schema** (content pages)
   - WebPage type with speakable property
   - Main entity references

6. **Implement Article schema** (blog/content pages)
   - Article metadata (author, publish date, headline)
   - Publisher information

7. **Run schema-markup.spec.ts to verify** all 7 tests pass

### Phase 4: Fix SEO Meta Tags (6 tests - SEO Meta)

**Goal**: Implement complete SEO meta tags including hreflang
**Estimated Time**: 1-2 hours
**Expected Outcome**: 79/108 tests passing (73% pass rate)

#### Test Suite: `seo-meta.spec.ts`

#### Tasks:

1. **Implement hreflang tags** for multi-language support
   - Add to all pages via Next.js Metadata API
   - Include all language variants (en, it, he)
   - Include x-default for default language

2. **Fix canonical URLs**
   - Ensure canonical URL matches current language
   - Format: `https://affilibuster.com/{lang}/{path}`

3. **Add language-specific meta tags**
   - og:locale for current language
   - og:locale:alternate for other languages

4. **Ensure robots meta tag** on all pages
   - index, follow for normal pages
   - noindex, nofollow for error pages (404, 410)

5. **Verify structured data (JSON-LD)** from Phase 3
   - Ensure JSON-LD renders in `<head>`

6. **Run seo-meta.spec.ts to verify** all 6 tests pass

### Phase 5: Implement 301 Redirects and 410 Gone (5 tests - Redirects)

**Goal**: Implement redirect handling and 410 Gone pages
**Estimated Time**: 2-3 hours
**Expected Outcome**: 84/108 tests passing (78% pass rate)

#### Test Suite: `redirects.spec.ts`

#### Tasks:

1. **Create redirect mapping system**
   - Add `url_redirects` table to database (if needed)
   - Store old URL → new URL mappings
   - Include redirect type (301, 302, 410)

2. **Implement 301 permanent redirects**
   - Create Next.js middleware for redirect handling
   - Check incoming URL against redirect mappings
   - Return 301 status with Location header
   - Maintain language context during redirects

3. **Create 410 Gone page**
   - Similar to 404 page but different status code
   - Create `src/app/[lang]/gone.tsx` or use middleware
   - Fetch 410 error content from CMS
   - Add test IDs: `gone-page`, `gone-home-link`

4. **Backend API for redirect rules**
   - Add `/api/redirects/{old_url}` endpoint
   - Return new URL and redirect type
   - Update OpenAPI spec

5. **Run redirects.spec.ts to verify** all 5 tests pass

### Phase 6: Fix Accessibility Violations (5 tests - A11y)

**Goal**: Fix WCAG 2.1 AA compliance issues
**Estimated Time**: 2-3 hours
**Expected Outcome**: 89/108 tests passing (82% pass rate)

#### Test Suite: `test_a11y.spec.ts`

#### Tasks:

1. **Run axe-core scan** on failing pages
   - Homepage (en, it, he)
   - Product pages
   - Identify specific violations

2. **Fix common accessibility issues**
   - Missing ARIA labels on interactive elements
   - Improper heading hierarchy
   - Insufficient color contrast
   - Missing alt text on images
   - Keyboard navigation issues

3. **Verify Language Switcher accessibility**
   - Ensure keyboard accessible (Tab, Enter, Arrow keys)
   - Proper ARIA attributes (aria-label, aria-expanded, aria-haspopup)
   - Focus management

4. **Verify heading hierarchy** (h1 → h2 → h3)
   - Only one h1 per page
   - No skipped levels
   - Proper semantic structure

5. **Run test_a11y.spec.ts to verify** all 5 tests pass

### Phase 7: Fix Performance Issues (5 tests - Performance)

**Goal**: Optimize page load time and meet performance targets
**Estimated Time**: 2-3 hours
**Expected Outcome**: 94/108 tests passing (87% pass rate)

#### Test Suite: `performance.spec.ts`

#### Tasks:

1. **Optimize page load time** (<2 seconds target)
   - Reduce JavaScript bundle size
   - Implement code splitting for routes
   - Remove unused dependencies
   - Enable compression (gzip/brotli)

2. **Implement lazy loading for images** below the fold
   - Use Next.js `<Image>` component with `loading="lazy"`
   - Add `priority` prop to above-the-fold images
   - Implement blur placeholders (LQIP)

3. **Optimize JavaScript bundling**
   - Analyze bundle with `next/bundle-analyzer`
   - Code split large components
   - Dynamic imports for heavy features
   - Tree shaking for unused code

4. **Implement font optimization**
   - Use `next/font` for font loading
   - Preload critical fonts
   - Use font-display: swap

5. **Minimize Time to Interactive (TTI)**
   - Defer non-critical JavaScript
   - Reduce main thread blocking
   - Optimize third-party scripts

6. **Run performance.spec.ts to verify** all 5 tests pass

### Phase 8: Fix Currency & Language Features (8 tests)

**Goal**: Implement currency selection, language detection, and preference persistence
**Estimated Time**: 2-3 hours
**Expected Outcome**: 102/108 tests passing (94% pass rate)

#### Test Suites: `currency-selection.spec.ts`, `language-detection.spec.ts`

#### Tasks:

1. **Implement language detection with prompt**
   - Create `useLanguageDetection` hook to detect browser language
   - Show prompt when browser lang ≠ site lang
   - Save dismissal preference to localStorage
   - Add test IDs: `language-prompt`, `accept-language-{code}`, `dismiss-language-prompt`

2. **Fix currency selection persistence**
   - Save currency choice to localStorage/cookies
   - Persist across page navigation
   - Restore on page reload

3. **Implement currency-based formatting**
   - Format prices according to selected currency locale
   - USD: $1,234.56
   - EUR: 1.234,56 €
   - ILS: ₪1,234.56

4. **Set default currency based on language**
   - English → USD
   - Italian → EUR
   - Hebrew → ILS

5. **Convert prices when currency changes**
   - Fetch exchange rates from API
   - Apply conversion to all displayed prices
   - Update dynamically without page reload

6. **Run currency-selection.spec.ts and language-detection.spec.ts** to verify all 8 tests pass

### Phase 9: Fix 404 Metadata & RTL Layout (4 tests)

**Goal**: Fix 404 page title metadata and RTL navigation mirroring
**Estimated Time**: 1-2 hours
**Expected Outcome**: 106/108 tests passing (98% pass rate)

#### Test Suites: `404-localization.spec.ts`, `rtl-layout.spec.ts`

#### Tasks:

1. **Fix 404 page title metadata** (3 tests)
   - Next.js limitation: metadata in `not-found.tsx` not applied
   - Workaround: Set metadata in layout that calls `notFound()`
   - OR: Update tests to not expect title (document limitation)
   - OR: Use client-side `useEffect` to set document.title

2. **Fix RTL navigation mirroring** (1 test)
   - Ensure navigation elements mirror for Hebrew (RTL)
   - Use `dir="rtl"` on `<html>` tag
   - Verify Tailwind RTL utilities work correctly
   - Test menu alignment, flex direction reversal

3. **Fix 404 homepage navigation** (from earlier test failure)
   - Test expected `/` but got `/en`
   - Update 404 home link to use just `/` (redirect middleware should handle)
   - OR: Update test to expect `/en`

4. **Run 404-localization.spec.ts and rtl-layout.spec.ts** to verify all 4 tests pass

### Phase 10: Final Polish & Verification (2 tests remaining)

**Goal**: Fix any remaining edge cases and achieve 100% E2E pass rate
**Estimated Time**: 1 hour
**Expected Outcome**: 108/108 tests passing (100% pass rate)

#### Tasks:

1. **Run full E2E test suite** across all browsers
   - Chromium (primary)
   - Firefox, WebKit, Mobile Chrome, Mobile Safari
   - Identify any browser-specific failures

2. **Fix any remaining failures**
   - Review test output for edge cases
   - Fix configuration issues
   - Adjust tests if needed (document why)

3. **Verify 100% unit test coverage maintained**
   - Run `npm test -- --coverage`
   - Ensure all new components have 100% coverage
   - No decrease in coverage from new features

4. **Update style guide** with all new components
   - Ensure all components documented
   - Add usage examples and code snippets
   - Test style guide page renders correctly

5. **Final verification**
   - All 108 tests passing
   - 100% unit test coverage
   - No performance degradation
   - All features working in all supported languages

## Testing Strategy

### Unit Tests (TDD - Write First)
- All new components must have unit tests written BEFORE implementation
- Test all props, states, and user interactions
- Mock API calls and external dependencies
- Achieve 100% coverage (lines, branches, functions, statements)

### E2E Tests (Already Exist - Guide Implementation)
- E2E tests already exist and are failing
- Use failing tests to guide implementation requirements
- Run tests frequently during development to verify progress
- Final verification: All 108 tests passing in all 5 browsers

### Integration Tests
- Test component integration (e.g., LanguagePrompt with LanguageSwitcher)
- Test API integration (e.g., RelatedProducts with backend API)
- Test routing and navigation flows

## Rollout Plan

1. **Development**: Complete all 10 phases sequentially on feature branch
2. **Testing**: Run E2E tests after each phase to verify progress
3. **Unit Testing**: Maintain 100% coverage throughout (write tests before implementation)
4. **Code Review**: Submit PR with full test results after all phases complete
5. **QA**: Manual testing on staging environment
6. **Deployment**: Merge to main and deploy to production
7. **Monitoring**: Watch for errors in production logs and performance metrics

## Success Metrics

- ✅ All 108 E2E tests passing (100% pass rate)
- ✅ 100% unit test coverage maintained
- ✅ No performance degradation (<3s page load)
- ✅ All components in style guide
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ All new code strongly typed (no `any`)

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Backend API changes needed | Medium | Medium | Define API contracts in OpenAPI first, implement backend in parallel |
| Test flakiness in new E2E tests | Medium | Low | Use Playwright best practices, add explicit waits, use stable selectors |
| Performance impact from new components | Low | Low | Lazy load components, optimize bundle size, run performance tests |
| Missing test coverage edge cases | Medium | Low | Strict TDD approach, review coverage reports, add tests for edge cases |

## Dependencies

### External Dependencies
- None required (all features use existing dependencies)

### Internal Dependencies
- Existing API endpoints for products, languages, currencies
- May need new endpoints for related products and category filtering
- CMS content types for categories (may already exist in Strapi)

## Timeline

| Phase | Focus Area | Duration | Cumulative | Tests Fixed |
|-------|-----------|----------|------------|-------------|
| Phase 1 | URL Routing Bugs | 1-2 hours | 1-2 hours | 7 tests → 61/108 (56%) |
| Phase 2 | Sitemap Generation | 1-2 hours | 2-4 hours | 5 tests → 66/108 (61%) |
| Phase 3 | Schema.org Markup | 2-3 hours | 4-7 hours | 7 tests → 73/108 (68%) |
| Phase 4 | SEO Meta Tags | 1-2 hours | 5-9 hours | 6 tests → 79/108 (73%) |
| Phase 5 | Redirects & 410 Pages | 2-3 hours | 7-12 hours | 5 tests → 84/108 (78%) |
| Phase 6 | Accessibility Fixes | 2-3 hours | 9-15 hours | 5 tests → 89/108 (82%) |
| Phase 7 | Performance Optimization | 2-3 hours | 11-18 hours | 5 tests → 94/108 (87%) |
| Phase 8 | Currency & Language | 2-3 hours | 13-21 hours | 8 tests → 102/108 (94%) |
| Phase 9 | 404 Metadata & RTL | 1-2 hours | 14-23 hours | 4 tests → 106/108 (98%) |
| Phase 10 | Final Polish | 1 hour | 15-24 hours | 2 tests → 108/108 (100%) |

**Total Estimated Time**: 15-24 hours of focused development

## Next Steps

1. ✅ Review and approve this plan
2. ✅ Analyze E2E test failures and categorize by root cause
3. **NOW**: Begin Phase 1 - Fix URL routing bugs in product navigation
4. Run E2E tests after each phase to verify progress
5. Continue sequentially through all 10 phases until 108/108 tests pass
6. Maintain 100% unit test coverage throughout (TDD approach)
7. Submit PR with complete test results when all phases are complete
