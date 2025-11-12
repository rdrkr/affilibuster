# Feature Specification: E2E Test Coverage Completion

**Feature Branch**: `005-e2e-test-coverage`
**Created**: 2025-11-14
**Status**: In Progress
**Input**: E2E test failure analysis from frontend/tests/e2e

## Problem Statement

The frontend currently has 108 end-to-end tests written using Playwright, but 63 tests (58%) are failing. After fixing the Docker networking issue (NEXT_PUBLIC_API_URL configuration), we now have 45 tests passing. The remaining failures fall into two categories:

1. **Missing Test IDs** (~35 failures): Existing, working features that lack `data-testid` attributes for test selectors
2. **Missing Features** (~28 failures): Functionality that tests expect but hasn't been implemented yet

This specification addresses both categories to achieve 100% E2E test pass rate.

## Current Test Status

- **Total Tests**: 108
- **Passing**: 45 (42%)
- **Failing**: 63 (58%)
- **Test Framework**: Playwright
- **Browser Coverage**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

## Failure Analysis

### Category 1: Missing Test IDs (Quick Wins)

These components exist and work correctly but lack test IDs for E2E test selectors:

| Test ID | Component | References | Impact | File Location |
|---------|-----------|------------|--------|---------------|
| `currency-selector` | CurrencySelector dropdown | 15 tests | Currency selection tests | `frontend/src/components/CurrencySelector.tsx:103` |
| `language-selector` | LanguageSwitcher dropdown | 13 tests | Language switching tests | `frontend/src/components/LanguageSwitcher.tsx:140` |
| `404-page` | 404 error page container | 12 tests | 404 page localization | `frontend/src/app/[lang]/not-found.tsx:40` |
| `404-home-link` | Home link on 404 page | 6 tests | 404 navigation | `frontend/src/app/[lang]/not-found.tsx:57` |
| `410-page` | 410 Gone page (if exists) | 3 tests | HTTP status pages | Investigation needed |
| `breadcrumb` | Breadcrumb navigation | 3 tests | Navigation context | Investigation needed |
| `main-navigation` | Header navigation | 2 tests | Site navigation | `frontend/src/components/Header.tsx` |
| `price` | Product price display | 2 tests | Price rendering | Product components |
| `breadcrumb-home` | Home link in breadcrumb | 2 tests | Breadcrumb navigation | Investigation needed |

**Total Test IDs to Add**: ~9-12 (depending on feature existence)

### Category 2: Missing Features (Implementation Required)

These are features that tests expect but don't exist in the codebase:

#### 2.1 Language Detection Prompt (Medium Priority)
**Test IDs**: `language-prompt`, `dismiss-language-prompt`, `accept-language-italian`
**References**: 3+ tests in `language-detection.spec.ts`
**User Story**: As a visitor with a non-English browser language, I want to be prompted to switch to my preferred language so that I can read content in my native language.

**Acceptance Scenarios**:
1. **Given** I visit the site with an Italian browser language setting, **When** the homepage loads, **Then** I see a prompt offering to switch to Italian
2. **Given** I see the language prompt, **When** I click "Accept" for Italian, **Then** I am redirected to `/it` and the prompt dismisses
3. **Given** I see the language prompt, **When** I click "Dismiss", **Then** the prompt disappears and my choice is remembered (localStorage)
4. **Given** I previously dismissed the language prompt, **When** I reload the page, **Then** the prompt does not appear again
5. **Given** I am already viewing the Italian version, **When** I reload the page, **Then** no language prompt appears

#### 2.2 Related Products Section (Medium Priority)
**Test IDs**: `related-products`, `related-product`
**References**: 3+ tests in `content-navigation.spec.ts`
**User Story**: As a user viewing a product, I want to see related or similar products so that I can discover alternatives and make informed decisions.

**Acceptance Scenarios**:
1. **Given** I am viewing a product page, **When** the page loads, **Then** I see a "Related Products" section with at least 3 similar products
2. **Given** I see related products, **When** each product displays, **Then** it shows thumbnail, name, price, and link
3. **Given** I click on a related product, **When** the product page loads, **Then** I see that product's details and its own related products

#### 2.3 Pagination Component (Low Priority)
**Test IDs**: `pagination-next`, `pagination-prev`, `pagination-page-N`
**References**: 2+ tests in `content-navigation.spec.ts`
**User Story**: As a user browsing product listings, I want to navigate through multiple pages of results so that I can view all available products without overwhelming my browser.

**Acceptance Scenarios**:
1. **Given** I am on a product listing page with >20 products, **When** the page loads, **Then** I see pagination controls showing page numbers and next/previous buttons
2. **Given** I am on page 1, **When** I click "Next", **Then** I navigate to page 2 and the URL updates to include `?page=2`
3. **Given** I am on page 2, **When** I click "Previous", **Then** I navigate back to page 1
4. **Given** I am on the last page, **When** the page loads, **Then** the "Next" button is disabled

#### 2.4 Category Filter (Medium Priority)
**Test IDs**: `category-filter`, `category-electronics`, `category-[name]`
**References**: 2+ tests in `content-navigation.spec.ts`
**User Story**: As a user browsing products, I want to filter by category so that I can quickly find products in my area of interest.

**Acceptance Scenarios**:
1. **Given** I am on the products page, **When** the page loads, **Then** I see a category filter dropdown with all available categories
2. **Given** I open the category filter, **When** I select "Electronics", **Then** the product list updates to show only electronics and the URL includes `?category=electronics`
3. **Given** I have a category filter applied, **When** I select "All Categories", **Then** the filter is cleared and all products are shown

#### 2.5 Dropdown Menu Test IDs (Low Priority)
**Test IDs**: `language-option-it`, `language-option-he`, `currency-option-EUR`, `currency-option-GBP`
**References**: 4+ tests across multiple spec files
**User Story**: As a test engineer, I need individual dropdown menu items to be identifiable so that E2E tests can verify selection behavior.

**Acceptance Scenarios**:
1. **Given** dropdowns are opened, **When** menu items render, **Then** each option has a `data-testid` based on its value (e.g., `language-option-it` for Italian)

## Success Criteria

1. **100% E2E Test Pass Rate**: All 108 tests pass in all 5 browser configurations
2. **Test Coverage**: All new features have corresponding unit tests (100% coverage maintained)
3. **Component Reusability**: New components follow DRY principles and are added to the style guide
4. **Performance**: No degradation in page load times (<3s on 3G)
5. **Accessibility**: All new UI elements meet WCAG 2.1 AA standards
6. **Type Safety**: All new code is strongly typed with explicit type annotations

## Non-Goals

- **Social Authentication**: Out of scope (covered in 004-user-authentication)
- **Product Recommendations Algorithm**: Related products will use simple category/tag matching, not ML
- **Advanced Filtering**: Multi-select filters, price ranges, etc. (future enhancement)
- **Infinite Scroll**: Using traditional pagination for now

## Technical Constraints

- **Existing Design System**: All new components must use Tailwind design tokens from the style guide
- **i18n Support**: All features must support English, Italian, and Hebrew (including RTL)
- **Dark Mode**: All UI components must support dark mode
- **Mobile Responsive**: All features must work on mobile devices (tested in Playwright)
- **100% Test Coverage**: Non-negotiable for both frontend and backend

## Dependencies

- No new external dependencies required
- Uses existing: React 19, Next.js 16, Tailwind CSS 4, Playwright
- Backend API endpoints may be needed for:
  - Related products logic
  - Category filtering
  - Pagination data

## Timeline Estimate

- **Phase 1** (Adding Test IDs): 2-3 hours
- **Phase 2** (Missing Features): 4-6 hours
- **Phase 3** (Polish & Edge Cases): 2-3 hours
- **Total**: 8-12 hours of development time

## Risk Assessment

**Low Risk**:
- Adding test IDs is non-breaking and straightforward
- Components follow established patterns in the codebase

**Medium Risk**:
- Related products requires product relationship logic (category/tag based)
- Category filtering may need backend API changes

**Mitigation**:
- Test-first approach ensures no regressions
- Incremental implementation allows validation at each step
- Use existing Strapi content types where possible
