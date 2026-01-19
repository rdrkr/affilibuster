# E2E Test Coverage - Quick Start Guide

**Last Updated**: 2025-11-15 (Session 2 Complete)
**Branch**: `claude/fix-frontend-test-bash-path-01J6DdwizfzmfkTSRo6QTmbQ`
**Detailed Docs**: [status.md](./status.md) ⭐ | [plan.md](./plan.md) | [tasks.md](./tasks.md)

## TL;DR - Current Status

**Total E2E Tests**: 108
**Currently Passing**: ~67/108 (62%)
**Target**: 108/108 (100%)

### Session 2 Accomplishments ✅

- ✅ **MAJOR BREAKTHROUGH**: Solved JSON-LD schema markup rendering
  - Created `JsonLd` client component for schema injection
  - All 25 non-skipped schema tests now passing (100%)
- ✅ Maintained backend pagination fixes from Session 1
- ✅ Phase 1: Content Navigation - 37/40 passing (92.5%)
- ✅ Phase 3: Schema Markup - 25/25 passing (100%)

### Critical Next Steps (Start Here!)

1. **Run `make all`** - Rebuild everything and verify all changes applied
2. **Verify Homepage Metadata** - Check if frontend restart fixed "404" title issue
3. **Complete Phase 4** - Add hreflang, canonical, og:locale to generateMetadata
4. **Complete Phase 2** - Refactor sitemap using Next.js generateSitemaps API

---

## Immediate Action Plan (Next Session)

### Step 1: Rebuild & Verify (5-10 minutes)

```bash
# From project root
make all

# Verify frontend is serving correctly
curl -s http://localhost:3000/en | grep -o '<title>.*</title>'
# Expected: <title>Affilibuster</title>
# NOT: <title>404 - Page Not Found</title>

# If still showing 404, restart frontend again
docker-compose restart frontend
```

### Step 2: Complete Phase 4 - SEO Meta Tags (30-45 minutes)

**Goal**: Fix 4 failing SEO meta tag tests

**Current**: 5/9 passing
**Target**: 9/9 passing

#### Task 2.1: Add Hreflang, Canonical, OG Locale

Edit `frontend/src/app/[lang]/page.tsx` - Update `generateMetadata`:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const lang = (resolvedParams.lang as LanguageCode) || 'en'

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Map language codes to OG locales
  const ogLocaleMap = {
    en: 'en_US',
    it: 'it_IT',
    he: 'he_IL',
  } as const

  return {
    title: 'Affilibuster',
    description: 'Find the best products with our affiliate platform',

    // Hreflang tags for multi-language SEO
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        'en': `${SITE_URL}/en`,
        'it': `${SITE_URL}/it`,
        'he': `${SITE_URL}/he`,
        'x-default': `${SITE_URL}/en`,
      },
    },

    // Open Graph locale
    openGraph: {
      locale: ogLocaleMap[lang],
      type: 'website',
      url: `${SITE_URL}/${lang}`,
      title: 'Affilibuster',
      description: 'Find the best products with our affiliate platform',
    },
  }
}
```

#### Task 2.2: Verify SEO Tests Pass

```bash
cd frontend
npm run test:e2e -- seo-meta.spec.ts --project=chromium

# Expected: 9/9 passing
```

---

### Step 3: Complete Phase 2 - Advanced Sitemap (45-60 minutes)

**Goal**: Implement sitemap index and language-specific sitemaps

**Current**: Basic sitemap.ts created, tests not passing
**Target**: 9/9 sitemap tests passing

#### Task 3.1: Create Sitemap Index Route

Create `frontend/src/app/sitemap_index.xml/route.ts`:

```typescript
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const LANGUAGES = ['en', 'it', 'he'] as const

export async function GET() {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${LANGUAGES.map(lang => `  <sitemap>
    <loc>${SITE_URL}/sitemap-${lang}.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
```

#### Task 3.2: Create Language-Specific Sitemap Routes

Create `frontend/src/app/sitemap-[lang].xml/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/client'
import { isLanguageCode, type LanguageCode } from '@/lib/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const LANGUAGES = ['en', 'it', 'he'] as const

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  if (!isLanguageCode(lang)) {
    return new NextResponse('Invalid language', { status: 404 })
  }

  // Static pages for this language
  const staticRoutes = [
    { path: '', priority: 1.0, changefreq: 'daily' },
    { path: 'products', priority: 0.9, changefreq: 'daily' },
    { path: 'about', priority: 0.7, changefreq: 'weekly' },
    { path: 'contact', priority: 0.6, changefreq: 'monthly' },
  ]

  // Fetch products for this language
  let products: any[] = []
  try {
    const productsResponse = await getProducts({
      locale: lang,
      'pagination[pageSize]': 100,
    } as Parameters<typeof getProducts>[0])

    if (productsResponse?.data) {
      products = productsResponse.data
    }
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error)
  }

  const now = new Date().toISOString()

  // Generate alternate links for each URL
  const generateAlternates = (path: string) => {
    return LANGUAGES.map(altLang =>
      `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${SITE_URL}/${altLang}${path}" />`
    ).join('\n') +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${path}" />`
  }

  const urlEntries = [
    // Static pages
    ...staticRoutes.map(route => {
      const path = route.path ? `/${route.path}` : ''
      return `  <url>
    <loc>${SITE_URL}/${lang}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
${generateAlternates(path)}
  </url>`
    }),

    // Product pages
    ...products.map(product => {
      if (!product.slug) return ''
      const path = `/products/${product.slug}`
      return `  <url>
    <loc>${SITE_URL}/${lang}${path}</loc>
    <lastmod>${product.updatedAt || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${generateAlternates(path)}
  </url>`
    }).filter(Boolean),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

export function generateStaticParams() {
  return LANGUAGES.map(lang => ({ lang }))
}
```

#### Task 3.3: Update or Remove Basic Sitemap

**Recommended**: Delete `frontend/src/app/sitemap.ts` since we have custom routes

```bash
rm frontend/src/app/sitemap.ts
```

#### Task 3.4: Verify Sitemap Tests Pass

```bash
cd frontend
npm run test:e2e -- sitemap.spec.ts --project=chromium

# Expected: All sitemap tests passing
```

---

### Step 4: Quick Wins - Fix Mobile Navigation (15 minutes)

**Goal**: Fix 2 mobile navigation visibility failures from Phase 1

```bash
# Run mobile tests to see exact failure
npm run test:e2e -- content-navigation.spec.ts --project="Mobile Chrome"

# Likely fix: Update navigation component to show menu button on mobile
```

---

## Progress Tracking

### Phase Status Matrix

| Phase | Tests | Status | Priority |
|-------|-------|--------|----------|
| Phase 1: Content Navigation | 40 | 37/40 (92.5%) | P3 - Mobile fixes |
| Phase 2: Sitemap Generation | 9 | 0/9 (0%) | **P2 - In Progress** |
| Phase 3: Schema.org JSON-LD | 25 | 25/25 (100%) ✅ | **DONE** |
| Phase 4: SEO Meta Tags | 9 | 5/9 (55.6%) | **P1 - In Progress** |
| Phase 5: Redirects & 410 Pages | 5 | 0/5 (0%) | P4 |
| Phase 6: WCAG Accessibility | 5 | 0/5 (0%) | P5 |
| Phase 7: Performance | 5 | 0/5 (0%) | P6 |
| Phase 8: Currency & Language | 8 | 0/8 (0%) | P7 |
| Phase 9: 404 & RTL | 4 | 0/4 (0%) | P8 |
| Phase 10: Final Verification | 2 | 0/2 (0%) | P9 |
| **TOTAL** | **108** | **~67/108 (62%)** | |

### Estimated Time to Completion

- **Phase 4 (SEO Meta)**: 30-45 minutes
- **Phase 2 (Sitemap)**: 45-60 minutes
- **Phase 1 (Mobile fixes)**: 15 minutes
- **Phase 5-10**: 4-6 hours total

**Total Remaining**: ~6-8 hours to reach 100% E2E test coverage

---

## Key Files Reference

### Created This Session

- ✅ `frontend/src/components/JsonLd.tsx` - Client component for JSON-LD injection

### Modified This Session

- ✅ `frontend/src/components/index.ts` - Export JsonLd
- ✅ `frontend/src/app/[lang]/page.tsx` - Use JsonLd for Organization schema

### To Modify Next

- `frontend/src/app/[lang]/page.tsx` - Add hreflang, canonical, og:locale
- `frontend/src/app/sitemap-[lang].xml/route.ts` - NEW: Language-specific sitemaps
- `frontend/src/app/sitemap_index.xml/route.ts` - NEW: Sitemap index
- `frontend/src/app/sitemap.ts` - DELETE or keep as fallback

### Backend (Maintained)

- `backend/src/affilibuster_backend/infrastructure/cms/strapi_repository_impl.py` - camelCase conversion

---

## Common Issues & Solutions

### Issue 1: Homepage Shows "404 - Page Not Found" Title

**Symptom**: Page returns 200 OK but metadata shows 404 title
**Cause**: Next.js dev mode metadata caching
**Solution**: `docker-compose restart frontend`

### Issue 2: JSON-LD Script Not Appearing in HTML

**Symptom**: Playwright can't find `script[type="application/ld+json"]`
**Cause**: Using Next.js Script component or raw `<script>` tags
**Solution**: Use `JsonLd` client component (already implemented)

### Issue 3: Hreflang Tags Not Rendering

**Symptom**: `link[rel="alternate"][hreflang]` elements missing
**Cause**: Not using Next.js Metadata API `alternates`
**Solution**: Add `alternates` to `generateMetadata` (see Step 2.1)

### Issue 4: Backend Integration Tests Failing

**Symptom**: 3 tests in `test_products_route.py` failing with 502
**Cause**: Pre-existing failures, unrelated to E2E work
**Solution**: Ignore for now, focus on E2E tests

---

## Testing Commands

```bash
# Full E2E test suite (all 108 tests)
cd frontend
npm run test:e2e

# Specific phase tests
npm run test:e2e -- content-navigation.spec.ts   # Phase 1
npm run test:e2e -- sitemap.spec.ts              # Phase 2
npm run test:e2e -- schema-markup.spec.ts        # Phase 3
npm run test:e2e -- seo-meta.spec.ts             # Phase 4

# Single browser
npm run test:e2e -- seo-meta.spec.ts --project=chromium

# Single test
npm run test:e2e -- seo-meta.spec.ts -g "hreflang" --project=chromium

# Unit tests (must maintain 100% coverage)
npm test -- --coverage
```

---

## Next Session Checklist

- [ ] Run `make all` to rebuild everything
- [ ] Verify homepage title is "Affilibuster" (not "404")
- [ ] Add hreflang, canonical, og:locale to generateMetadata
- [ ] Run SEO meta tests - expect 9/9 passing
- [ ] Create sitemap_index.xml route
- [ ] Create sitemap-[lang].xml routes
- [ ] Delete or update basic sitemap.ts
- [ ] Run sitemap tests - expect 9/9 passing
- [ ] Update status.md with progress
- [ ] Commit changes with meaningful message

**Start with**: `make all` then verify no regressions!

---

## Success Criteria

### Session Complete When

- ✅ All Phase 4 SEO meta tests passing (9/9)
- ✅ All Phase 2 sitemap tests passing (9/9)
- ✅ Homepage metadata shows "Affilibuster" (not "404")
- ✅ Hreflang, canonical, og:locale tags present
- ✅ Sitemap index and language-specific sitemaps working

### Milestone: 80% Coverage When

- Phase 1-4 complete
- ~87/108 tests passing

### Final Goal: 100% Coverage When

- All 108 E2E tests passing
- All phases 1-10 complete
- Backend and frontend unit tests still at 100%
