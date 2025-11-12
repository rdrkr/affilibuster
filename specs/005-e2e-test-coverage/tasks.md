# Task Breakdown: E2E Test Coverage Completion

**Branch**: `005-e2e-test-coverage` | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Phase 1: Add Test IDs to Existing Components (Quick Wins)

### Task 1.1: Add Test IDs to CurrencySelector
**File**: `frontend/src/components/CurrencySelector.tsx`
**Test Impact**: Fixes 15 failing tests
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Add `data-testid="currency-selector"` to Dropdown button (line ~108)
- [ ] Add `data-testid="currency-option-{code}"` to each currency option in renderItem
- [ ] Run `npm test -- CurrencySelector` to verify unit tests still pass
- [ ] Run E2E test: `npx playwright test currency-selection --project=chromium`
- [ ] Verify 15 currency-related tests now pass

**Expected Result**: Currency selection E2E tests pass

---

### Task 1.2: Add Test IDs to LanguageSwitcher
**File**: `frontend/src/components/LanguageSwitcher.tsx`
**Test Impact**: Fixes 13 failing tests
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Add `data-testid="language-selector"` to Dropdown button (line ~108)
- [ ] Add `data-testid="language-option-{code}"` to each language option in renderItem
- [ ] Run `npm test -- LanguageSwitcher` to verify unit tests still pass
- [ ] Run E2E test: `npx playwright test language --project=chromium`
- [ ] Verify 13 language-related tests now pass

**Expected Result**: Language switching E2E tests pass

---

### Task 1.3: Add Test IDs to 404 Not Found Page
**File**: `frontend/src/app/[lang]/not-found.tsx`
**Test Impact**: Fixes 12 failing tests
**Estimated Time**: 20 minutes

**Subtasks**:
- [ ] Add `data-testid="404-page"` to main container div (line ~40)
- [ ] Add `data-testid="404-home-link"` to home link/button (line ~57)
- [ ] Run E2E test: `npx playwright test 404-localization --project=chromium`
- [ ] Verify 12 404-related tests now pass

**Expected Result**: 404 page localization tests pass

---

### Task 1.4: Investigate and Add Breadcrumb Test IDs
**Files**: TBD (needs investigation)
**Test Impact**: Fixes 2-5 failing tests
**Estimated Time**: 45 minutes

**Subtasks**:
- [ ] Search codebase for breadcrumb component: `grep -r "breadcrumb" frontend/src/components`
- [ ] If found: Add `data-testid="breadcrumb"` to container, `data-testid="breadcrumb-home"` to home link
- [ ] If not found: Check if tests are correct or if breadcrumb needs to be created
- [ ] Investigate `main-navigation` test ID - likely in Header component
- [ ] Add `data-testid="main-navigation"` to Header navigation element
- [ ] Run E2E test: `npx playwright test content-navigation --project=chromium`
- [ ] Verify breadcrumb and navigation tests pass

**Expected Result**: Navigation tests pass

---

### Task 1.5: Add Test IDs to Price Display
**Files**: Product components (needs investigation)
**Test Impact**: Fixes 2 failing tests
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Locate price display in product listing/detail pages
- [ ] Search for price rendering: `grep -r "price" frontend/src/components`
- [ ] Add `data-testid="price"` to price display element
- [ ] Run E2E test: `npx playwright test currency-selection --project=chromium`
- [ ] Verify price-related tests pass

**Expected Result**: Price display tests pass

---

### Task 1.6: Investigate 410 Gone Page
**File**: TBD (needs investigation)
**Test Impact**: Fixes 3 failing tests (if page exists)
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Search for 410 page: `find frontend/src/app -name "*410*" -o -name "*gone*"`
- [ ] Check E2E tests: `grep -r "410" frontend/tests/e2e`
- [ ] If 410 page exists: Add `data-testid="410-page"` and `data-testid="410-home-link"`
- [ ] If not: Determine if tests need updating or if page needs to be created
- [ ] Run relevant E2E tests

**Expected Result**: 410 page tests pass or tests are corrected

---

## Phase 2: Implement Missing Features

### Task 2.1: Implement Language Detection Prompt

#### Task 2.1.1: Write Unit Tests for Language Detection Hook
**File**: `frontend/src/hooks/useLanguageDetection.test.ts` (NEW)
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Create test file with describe block for `useLanguageDetection`
- [ ] Test: Detects browser language from navigator.language
- [ ] Test: Returns shouldShow=false if browser lang matches site lang
- [ ] Test: Returns shouldShow=false if user previously dismissed
- [ ] Test: Returns shouldShow=true if browser lang differs and not dismissed
- [ ] Test: Handles unsupported browser languages gracefully
- [ ] Run: `npm test -- useLanguageDetection`
- [ ] Verify: All tests fail (RED phase - TDD)

**Expected Result**: 5-6 failing unit tests for language detection hook

---

#### Task 2.1.2: Implement Language Detection Hook
**File**: `frontend/src/hooks/useLanguageDetection.ts` (NEW)
**Estimated Time**: 45 minutes

**Subtasks**:
- [ ] Create hook that detects browser language using `navigator.language`
- [ ] Check localStorage for `dismissedLanguagePrompt` key
- [ ] Map browser language to supported LanguageCode (en, it, he)
- [ ] Return: `{ shouldShow: boolean, detectedLanguage: LanguageCode | null }`
- [ ] Run: `npm test -- useLanguageDetection`
- [ ] Verify: All tests pass (GREEN phase - TDD)
- [ ] Refactor if needed while keeping tests green

**Expected Result**: Hook implementation passes all unit tests

---

#### Task 2.1.3: Write Unit Tests for LanguagePrompt Component
**File**: `frontend/src/components/LanguagePrompt.test.tsx` (NEW)
**Estimated Time**: 45 minutes

**Subtasks**:
- [ ] Create test file with describe block for `LanguagePrompt`
- [ ] Test: Renders with correct test ID `language-prompt`
- [ ] Test: Shows detected language name (e.g., "Italiano")
- [ ] Test: Accept button has test ID `accept-language-{code}`
- [ ] Test: Dismiss button has test ID `dismiss-language-prompt`
- [ ] Test: Calls onAccept when accept button clicked
- [ ] Test: Calls onDismiss when dismiss button clicked
- [ ] Test: Does not render if shouldShow is false
- [ ] Test: Supports dark mode styling
- [ ] Test: Handles RTL languages correctly
- [ ] Run: `npm test -- LanguagePrompt`
- [ ] Verify: All tests fail (RED phase - TDD)

**Expected Result**: 8-10 failing unit tests for LanguagePrompt component

---

#### Task 2.1.4: Implement LanguagePrompt Component
**File**: `frontend/src/components/LanguagePrompt.tsx` (NEW)
**Estimated Time**: 60 minutes

**Subtasks**:
- [ ] Create component with props: `{ detectedLanguage, detectedLanguageName, onAccept, onDismiss }`
- [ ] Render modal/banner with language prompt message
- [ ] Add accept button with `data-testid="accept-language-{code}"`
- [ ] Add dismiss button with `data-testid="dismiss-language-prompt"`
- [ ] Style with Tailwind design tokens (primary colors, shadows, etc.)
- [ ] Support dark mode with `dark:` variants
- [ ] Support RTL with `dir` attribute
- [ ] Run: `npm test -- LanguagePrompt`
- [ ] Verify: All tests pass (GREEN phase - TDD)
- [ ] Refactor for DRY and reusability

**Expected Result**: Component implementation passes all unit tests

---

#### Task 2.1.5: Integrate LanguagePrompt into Layout
**File**: `frontend/src/app/[lang]/layout.tsx`
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Import `useLanguageDetection` hook and `LanguagePrompt` component
- [ ] Call hook to get `shouldShow` and `detectedLanguage`
- [ ] Render `<LanguagePrompt />` conditionally based on `shouldShow`
- [ ] Implement `onAccept`: `router.push(/${detectedLang}${pathname})`
- [ ] Implement `onDismiss`: Save to localStorage, hide prompt
- [ ] Run E2E test: `npx playwright test language-detection --project=chromium`
- [ ] Verify: 6 language-detection tests pass

**Expected Result**: Language detection E2E tests pass

---

#### Task 2.1.6: Add LanguagePrompt to Style Guide
**File**: `frontend/src/app/[lang]/style-guide/StyleGuideClient.tsx`
**Estimated Time**: 20 minutes

**Subtasks**:
- [ ] Import LanguagePrompt component
- [ ] Add new section "Language Detection Prompt"
- [ ] Show example with `shouldShow=true`, detected language
- [ ] Add code snippet showing usage
- [ ] Document props and behavior
- [ ] Run: `npm test -- style-guide`
- [ ] Verify: Style guide tests pass with new section

**Expected Result**: LanguagePrompt documented in style guide

---

### Task 2.2: Implement Related Products Section

#### Task 2.2.1: Write Unit Tests for useRelatedProducts Hook
**File**: `frontend/src/hooks/useRelatedProducts.test.ts` (NEW)
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Create test file with describe block for `useRelatedProducts`
- [ ] Test: Fetches related products from API
- [ ] Test: Returns loading state while fetching
- [ ] Test: Returns products on success
- [ ] Test: Returns error state on API failure
- [ ] Test: Caches results to avoid duplicate fetches
- [ ] Run: `npm test -- useRelatedProducts`
- [ ] Verify: All tests fail (RED phase - TDD)

**Expected Result**: 5-6 failing unit tests for related products hook

---

#### Task 2.2.2: Implement useRelatedProducts Hook
**File**: `frontend/src/hooks/useRelatedProducts.ts` (NEW)
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Create hook that calls API: `/products/{id}/related` or filters by category
- [ ] Return: `{ products, loading, error }`
- [ ] Use React Query or SWR for caching (if available)
- [ ] Handle empty results gracefully
- [ ] Run: `npm test -- useRelatedProducts`
- [ ] Verify: All tests pass (GREEN phase - TDD)

**Expected Result**: Hook implementation passes all unit tests

---

#### Task 2.2.3: Write Unit Tests for RelatedProducts Component
**File**: `frontend/src/components/RelatedProducts.test.tsx` (NEW)
**Estimated Time**: 45 minutes

**Subtasks**:
- [ ] Create test file with describe block for `RelatedProducts`
- [ ] Test: Renders with test ID `related-products`
- [ ] Test: Each product has test ID `related-product`
- [ ] Test: Displays product thumbnails, names, prices
- [ ] Test: Links to correct product pages
- [ ] Test: Shows loading state while fetching
- [ ] Test: Shows empty state if no related products
- [ ] Test: Handles errors gracefully
- [ ] Run: `npm test -- RelatedProducts`
- [ ] Verify: All tests fail (RED phase - TDD)

**Expected Result**: 7-8 failing unit tests for RelatedProducts component

---

#### Task 2.2.4: Implement RelatedProducts Component
**File**: `frontend/src/components/RelatedProducts.tsx` (NEW)
**Estimated Time**: 60 minutes

**Subtasks**:
- [ ] Create component with props: `{ currentProductId, category?, maxResults? }`
- [ ] Use `useRelatedProducts` hook to fetch data
- [ ] Render grid of product cards with test IDs
- [ ] Add loading skeleton while fetching
- [ ] Handle empty state with message
- [ ] Style with Tailwind design tokens
- [ ] Support responsive grid (1 col mobile, 3 cols desktop)
- [ ] Run: `npm test -- RelatedProducts`
- [ ] Verify: All tests pass (GREEN phase - TDD)

**Expected Result**: Component implementation passes all unit tests

---

#### Task 2.2.5: Add Backend Endpoint (if needed)
**File**: `backend/src/infrastructure/api/routes/products.py`
**Estimated Time**: 45 minutes (skip if frontend filtering is sufficient)

**Subtasks**:
- [ ] Add route: `GET /products/{id}/related`
- [ ] Implement logic: Match by category, tags, price range
- [ ] Limit to max 6 results
- [ ] Update OpenAPI spec: `contracts/template.openapi.yaml`
- [ ] Write unit tests for new endpoint
- [ ] Run: `pytest tests/unit/test_products.py`
- [ ] Verify: All tests pass

**Expected Result**: Backend endpoint returns related products

---

#### Task 2.2.6: Integrate RelatedProducts into Product Page
**File**: Product detail page (needs investigation)
**Estimated Time**: 20 minutes

**Subtasks**:
- [ ] Locate product detail page template
- [ ] Import and add `<RelatedProducts currentProductId={productId} />`
- [ ] Position below product details section
- [ ] Run E2E test: `npx playwright test content-navigation --project=chromium`
- [ ] Verify: 5 related-products tests pass

**Expected Result**: Related products E2E tests pass

---

#### Task 2.2.7: Add RelatedProducts to Style Guide
**File**: `frontend/src/app/[lang]/style-guide/StyleGuideClient.tsx`
**Estimated Time**: 20 minutes

**Subtasks**:
- [ ] Import RelatedProducts component
- [ ] Add section "Related Products"
- [ ] Show example with mock products
- [ ] Add code snippet and props documentation
- [ ] Run style guide tests

**Expected Result**: RelatedProducts documented in style guide

---

### Task 2.3: Implement Pagination Component

#### Task 2.3.1: Write Unit Tests for Pagination Component
**File**: `frontend/src/components/Pagination.test.tsx` (NEW)
**Estimated Time**: 45 minutes

**Subtasks**:
- [ ] Create test file with describe block for `Pagination`
- [ ] Test: Renders page numbers with test IDs `pagination-page-{N}`
- [ ] Test: Next button has test ID `pagination-next`
- [ ] Test: Previous button has test ID `pagination-prev`
- [ ] Test: Calls onPageChange when page button clicked
- [ ] Test: Next button disabled on last page
- [ ] Test: Previous button disabled on first page
- [ ] Test: Shows ellipsis for large page counts
- [ ] Test: Highlights current page
- [ ] Run: `npm test -- Pagination`
- [ ] Verify: All tests fail (RED phase - TDD)

**Expected Result**: 8-10 failing unit tests for Pagination component

---

#### Task 2.3.2: Implement Pagination Component
**File**: `frontend/src/components/Pagination.tsx` (NEW)
**Estimated Time**: 60 minutes

**Subtasks**:
- [ ] Create component with props: `{ currentPage, totalPages, onPageChange }`
- [ ] Render page number buttons (show 5 at a time with ellipsis)
- [ ] Add prev/next buttons with disabled states
- [ ] Add all required test IDs
- [ ] Style with Tailwind design tokens
- [ ] Support keyboard navigation (arrow keys)
- [ ] Run: `npm test -- Pagination`
- [ ] Verify: All tests pass (GREEN phase - TDD)

**Expected Result**: Component implementation passes all unit tests

---

#### Task 2.3.3: Integrate Pagination into Product Listing
**File**: Product listing page (needs investigation)
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Locate product listing page
- [ ] Add URL search param handling: `?page=2`
- [ ] Calculate totalPages from product count
- [ ] Add `<Pagination />` below product grid
- [ ] Update product fetch to include page param
- [ ] Run E2E test: `npx playwright test content-navigation --project=chromium`
- [ ] Verify: 4 pagination tests pass

**Expected Result**: Pagination E2E tests pass

---

#### Task 2.3.4: Add Pagination to Style Guide
**File**: `frontend/src/app/[lang]/style-guide/StyleGuideClient.tsx`
**Estimated Time**: 15 minutes

**Subtasks**:
- [ ] Import Pagination component
- [ ] Add section "Pagination"
- [ ] Show examples with different page counts
- [ ] Document props and behavior
- [ ] Run style guide tests

**Expected Result**: Pagination documented in style guide

---

### Task 2.4: Implement Category Filter

#### Task 2.4.1: Write Unit Tests for CategoryFilter Component
**File**: `frontend/src/components/CategoryFilter.test.tsx` (NEW)
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Create test file with describe block for `CategoryFilter`
- [ ] Test: Renders with test ID `category-filter`
- [ ] Test: Each category has test ID `category-{slug}`
- [ ] Test: Shows "All Categories" option
- [ ] Test: Calls onCategoryChange when selection changes
- [ ] Test: Highlights selected category
- [ ] Run: `npm test -- CategoryFilter`
- [ ] Verify: All tests fail (RED phase - TDD)

**Expected Result**: 5-6 failing unit tests for CategoryFilter component

---

#### Task 2.4.2: Implement CategoryFilter Component
**File**: `frontend/src/components/CategoryFilter.tsx` (NEW)
**Estimated Time**: 45 minutes

**Subtasks**:
- [ ] Create component with props: `{ categories, selectedCategory?, onCategoryChange }`
- [ ] Render dropdown with all categories
- [ ] Add "All Categories" option (null value)
- [ ] Add all required test IDs
- [ ] Style with Tailwind design tokens
- [ ] Run: `npm test -- CategoryFilter`
- [ ] Verify: All tests pass (GREEN phase - TDD)

**Expected Result**: Component implementation passes all unit tests

---

#### Task 2.4.3: Integrate CategoryFilter into Product Listing
**File**: Product listing page
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Add URL search param handling: `?category=electronics`
- [ ] Fetch categories from API or CMS
- [ ] Add `<CategoryFilter />` above product grid
- [ ] Update product fetch to include category filter
- [ ] Run E2E test: `npx playwright test content-navigation --project=chromium`
- [ ] Verify: 4 category filter tests pass

**Expected Result**: Category filter E2E tests pass

---

#### Task 2.4.4: Add CategoryFilter to Style Guide
**File**: `frontend/src/app/[lang]/style-guide/StyleGuideClient.tsx`
**Estimated Time**: 15 minutes

**Subtasks**:
- [ ] Import CategoryFilter component
- [ ] Add section "Category Filter"
- [ ] Show example with mock categories
- [ ] Document props and usage
- [ ] Run style guide tests

**Expected Result**: CategoryFilter documented in style guide

---

## Phase 3: Polish and Edge Cases

### Task 3.1: Run Full E2E Test Suite
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Run: `npm run test:e2e` (all browsers)
- [ ] Verify: 108/108 tests passing
- [ ] Check for any browser-specific failures
- [ ] Fix any flaky tests with explicit waits

**Expected Result**: All E2E tests pass in all browsers

---

### Task 3.2: Verify Test Coverage
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Run: `npm test -- --coverage`
- [ ] Verify: 100% coverage (lines, branches, functions, statements)
- [ ] Add tests for any uncovered branches
- [ ] Re-run coverage report

**Expected Result**: 100% test coverage maintained

---

### Task 3.3: Accessibility Audit
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Run E2E accessibility tests: `npx playwright test test_a11y --project=chromium`
- [ ] Fix any WCAG 2.1 AA violations
- [ ] Check aria labels on all new components
- [ ] Test keyboard navigation

**Expected Result**: All accessibility tests pass

---

### Task 3.4: Performance Testing
**Estimated Time**: 30 minutes

**Subtasks**:
- [ ] Run Lighthouse audit on key pages
- [ ] Verify: >90 performance score maintained
- [ ] Check bundle size impact: `npm run build`
- [ ] Optimize if bundle grew significantly

**Expected Result**: Performance targets maintained

---

### Task 3.5: Final Style Guide Verification
**Estimated Time**: 20 minutes

**Subtasks**:
- [ ] Visit `/en/style-guide` in browser
- [ ] Verify all new components appear correctly
- [ ] Check code snippets render properly
- [ ] Test examples are interactive
- [ ] Run: `npm test -- style-guide.test`

**Expected Result**: Style guide complete and tested

---

### Task 3.6: Documentation and Cleanup
**Estimated Time**: 20 minutes

**Subtasks**:
- [ ] Update CLAUDE.md if any new patterns were established
- [ ] Remove any console.logs or debug code
- [ ] Format all code: `npm run format`
- [ ] Lint all code: `npm run lint`
- [ ] Fix any linting errors

**Expected Result**: Codebase clean and documented

---

## Progress Tracking

### Phase 1: Add Test IDs
- [ ] Task 1.1: CurrencySelector test IDs
- [ ] Task 1.2: LanguageSwitcher test IDs
- [ ] Task 1.3: 404 page test IDs
- [ ] Task 1.4: Breadcrumb test IDs
- [ ] Task 1.5: Price display test IDs
- [ ] Task 1.6: 410 page investigation

**Target**: 80/108 tests passing (74%)

### Phase 2: Implement Features
- [ ] Task 2.1: Language Detection Prompt (6 tasks)
- [ ] Task 2.2: Related Products (7 tasks)
- [ ] Task 2.3: Pagination (4 tasks)
- [ ] Task 2.4: Category Filter (4 tasks)

**Target**: 100/108 tests passing (93%)

### Phase 3: Polish
- [ ] Task 3.1: Full E2E test suite
- [ ] Task 3.2: Test coverage verification
- [ ] Task 3.3: Accessibility audit
- [ ] Task 3.4: Performance testing
- [ ] Task 3.5: Style guide verification
- [ ] Task 3.6: Documentation and cleanup

**Target**: 108/108 tests passing (100%)

---

## Quick Reference

**Run E2E tests**: `npm run test:e2e` or `npx playwright test --project=chromium`
**Run unit tests**: `npm test` or `npm test -- ComponentName`
**Check coverage**: `npm test -- --coverage`
**Format code**: `npm run format`
**Lint code**: `npm run lint`
**Start dev server**: `npm run dev`
**Build production**: `npm run build`
