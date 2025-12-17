# Performance Optimization Plan: the-green-brother

**Created:** 2025-12-17
**Status:** Pending Implementation

## Overview

Deep analysis of the Next.js 16 frontend revealed significant performance optimization opportunities, primarily focused on reducing client components and addressing critical configuration issues.

## Current State Summary

- **Total Components:** 36 files
- **Client Components:** 11 (30.6%)
- **Server Components:** 25 (69.4%)
- **Critical Issue:** Image optimization completely disabled

---

## Phase 1: Client-to-Server Component Conversions (HIGH IMPACT, LOW RISK)

### 1.1 ProductCategoriesMenu

**File:** `src/components/menus/ProductCategoriesMenu.tsx`

**Finding:** Marked `'use client'` but has ZERO JavaScript interactivity. Dropdown is pure CSS (`:hover` via `group-hover:` classes).

**Change:** Remove `'use client'` directive (line 10). No other changes needed.

**Test:** `tests/components/menus/ProductCategoriesMenu.test.tsx`

---

### 1.2 BlogPostClient

**File:** `src/app/[lang]/blog/[id]/BlogPostClient.tsx`

**Finding:** Marked `'use client'` but has NO useState, NO useEffect, NO event handlers. Purely presentational with data transformation only.

**Changes:**

1. Remove `'use client'` directive (line 3)
2. Rename to `BlogPost.tsx` for clarity
3. Update import in `page.tsx`

**Test:** `tests/app/[lang]/blog/[id]/BlogPostClient.test.tsx`

---

### 1.3 ContactClient

**File:** `src/app/[lang]/contact/ContactClient.tsx`

**Finding:** Marked `'use client'` but has NO state, NO hooks, NO handlers. Extremely simple presentational component.

**Changes:**

1. Remove `'use client'` directive (line 3)
2. Optionally rename to `ContactContent.tsx`
3. Update import in `page.tsx`

**Test:** `tests/app/[lang]/contact/ContactClient.test.tsx`

---

### 1.4 NewsletterSignupCTA - KEEP AS CLIENT

**File:** `src/components/call-to-actions/NewsletterSignupCTA.tsx`

**Finding:** Has `onSubmit` handler that only calls `e.preventDefault()` - currently a no-op.

**Decision:** Keep as client component.

- User plans to add API call functionality in the future
- ButtonAction (used inside) is a client component by design (onClick prop)
- Converting to server would require refactoring to Server Actions approach

**No changes needed for this component.**

---

## Phase 2: Image Optimization Investigation (CRITICAL IMPACT)

### 2.1 Investigate WebP Rendering Issue

**File:** `next.config.ts` (line 61)

**Current:**

```typescript
unoptimized: true, // dynamic .webp file names do not unoptimized implcitly
```

**User Context:** Disabled because WebP files weren't rendering with optimization enabled.

**Root Cause Investigation Required:**

1. Check if CMS/Cloudinary serves pre-optimized WebP files
2. Test if Next.js double-optimization causes the issue
3. Verify remote patterns cover all image sources

**Proposed Solution (Test First):**

1. Remove `unoptimized: true` globally
2. If specific WebP images fail, add `unoptimized` prop to individual `<CMSImage>` components for those sources
3. Alternative: Add custom loader for WebP URLs from specific sources

```typescript
// Option A: Remove global, use per-image when needed
// In CMSImage component, detect .webp and pass unoptimized={true} for those

// Option B: Keep global but enable for non-WebP sources
// Configure loader to skip optimization for .webp files
```

**Testing Required:**

- Test all image sources (CMS, Cloudinary, Backend)
- Verify WebP files render correctly
- Compare Lighthouse scores before/after

**Risk:** Medium - Requires careful testing. Will test in dev before committing.

---

## Phase 3: Loading States (MEDIUM IMPACT, LOW RISK)

### 3.1 Add Loading Files

Create `loading.tsx` files for key routes to show skeleton/spinner during data fetch:

**Files to Create:**

- `src/app/[lang]/loading.tsx` (general)
- `src/app/[lang]/products/loading.tsx`
- `src/app/[lang]/products/[id]/loading.tsx`
- `src/app/[lang]/blog/loading.tsx`
- `src/app/[lang]/blog/[id]/loading.tsx`

**Pattern:**

```typescript
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
```

---

## Phase 4: ISR/Caching Strategy (HIGH IMPACT, LOW RISK)

### 4.1 Add Revalidation to Pages

Add `export const revalidate` to enable Incremental Static Regeneration:

| File                                    | Revalidate Value |
| --------------------------------------- | ---------------- |
| `src/app/[lang]/(homepage)/page.tsx`    | `300` (5 min)    |
| `src/app/[lang]/products/page.tsx`      | `300` (5 min)    |
| `src/app/[lang]/products/[id]/page.tsx` | `300` (5 min)    |
| `src/app/[lang]/blog/page.tsx`          | `600` (10 min)   |
| `src/app/[lang]/blog/[id]/page.tsx`     | `600` (10 min)   |
| `src/app/[lang]/about/page.tsx`         | `3600` (1 hour)  |
| `src/app/[lang]/contact/page.tsx`       | `3600` (1 hour)  |

**Pattern (add at top of each file):**

```typescript
export const revalidate = 300
```

---

## Phase 5: Dynamic Imports for Heavy Components (MEDIUM IMPACT, MEDIUM RISK)

### 5.1 Lazy Load Navigation Components

**File:** `src/components/navigation/Navigation.tsx`

**Components to Lazy Load:**

- `SearchMenu` - Has 3 useState hooks, 2 useEffect hooks, refs
- `MobileMenu` - Only needed on mobile viewports

**Pattern:**

```typescript
import dynamic from 'next/dynamic'

const SearchMenu = dynamic(() => import('@/components/menus/SearchMenu'), {
  ssr: false,
})

const MobileMenu = dynamic(() => import('./MobileMenu'), {
  ssr: false,
})
```

---

## Phase 6: SEO Metadata Enhancement (MEDIUM IMPACT, LOW RISK)

### 6.1 Add Open Graph and Twitter Cards

**Files to Modify:**

- `src/app/layout.tsx` - Default OG configuration
- `src/app/[lang]/products/[id]/page.tsx` - Dynamic product OG
- `src/app/[lang]/blog/[id]/page.tsx` - Dynamic blog OG

### 6.2 Add hreflang Tags

**File:** `src/app/[lang]/layout.tsx`

Add `alternates.languages` to `generateMetadata` for multi-language SEO.

---

## Components That Must Stay Client

These components legitimately require `'use client'`:

| Component             | Reason                                              |
| --------------------- | --------------------------------------------------- |
| `Navigation`          | useState, useRouter, usePathname                    |
| `MobileMenu`          | onClick handlers                                    |
| `BackToTopButton`     | useState, useEffect, window.scroll                  |
| `LanguageMenu`        | onClick callback                                    |
| `SearchMenu`          | 3x useState, 2x useEffect, refs                     |
| `ThemeMenu`           | onClick callback                                    |
| `CMSImage`            | useState for error handling                         |
| `ButtonAction`        | onClick prop (by design)                            |
| `NewsletterSignupCTA` | Uses ButtonAction (client), future API call planned |
| `HomeClient`          | useState + useEffect for animation                  |
| `AboutClient`         | useState + useEffect for animation                  |
| `ProductsClient`      | useState for filtering                              |
| `BlogClient`          | useState for tag filtering                          |
| `ProductDetailClient` | useState for gallery/quantity                       |

---

## Implementation Order (Recommended)

1. **Phase 1.1-1.3** - Server component conversions (safest, immediate wins)
2. **Phase 2.1** - Image optimization fix (critical performance impact)
3. **Phase 4.1** - ISR revalidation (high impact, very low risk)
4. **Phase 3.1** - Loading states (improves perceived performance)
5. **Phase 5.1** - Dynamic imports (requires skeleton components)
6. **Phase 6** - SEO metadata (important but not performance-critical)

---

## Expected Performance Improvements

| Metric     | Before        | After (Estimated)                 |
| ---------- | ------------- | --------------------------------- |
| LCP        | 2.5-3.5s      | 1.5-2.0s                          |
| FCP        | 2.0-3.0s      | 1.0-1.5s                          |
| JS Bundle  | Baseline      | -10-15% (fewer client components) |
| Image Size | 100% original | -50-70% (Next.js optimization)    |

---

## Files to Modify (Summary)

### Server Component Conversions (3 files):

- `src/components/menus/ProductCategoriesMenu.tsx` - Remove 'use client'
- `src/app/[lang]/blog/[id]/BlogPostClient.tsx` - Remove 'use client', rename to BlogPost.tsx
- `src/app/[lang]/contact/ContactClient.tsx` - Remove 'use client'

### Configuration:

- `next.config.ts`

### New Files (Loading States):

- `src/app/[lang]/loading.tsx`
- `src/app/[lang]/products/loading.tsx`
- `src/app/[lang]/products/[id]/loading.tsx`
- `src/app/[lang]/blog/loading.tsx`
- `src/app/[lang]/blog/[id]/loading.tsx`

### ISR Additions:

- `src/app/[lang]/(homepage)/page.tsx`
- `src/app/[lang]/products/page.tsx`
- `src/app/[lang]/products/[id]/page.tsx`
- `src/app/[lang]/blog/page.tsx`
- `src/app/[lang]/blog/[id]/page.tsx`
- `src/app/[lang]/about/page.tsx`
- `src/app/[lang]/contact/page.tsx`

### Dynamic Imports:

- `src/components/navigation/Navigation.tsx`

### SEO Enhancements:

- `src/app/layout.tsx`
- `src/app/[lang]/layout.tsx`
