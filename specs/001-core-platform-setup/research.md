# Research: Core Platform Setup & Multi-Language Infrastructure

**Date**: 2025-10-04
**Feature**: Core Platform Setup & Multi-Language Infrastructure

## 1. Next.js 14 App Router i18n Best Practices

### Decision
Use **next-intl** for internationalization with Next.js 14 App Router

### Rationale
- Native App Router support with middleware-based language detection
- Supports both Static Site Generation (SSG) and Incremental Static Regeneration (ISR)
- Provides URL-based routing strategy (/en, /it, /he) out of the box
- Minimal runtime overhead with compile-time optimizations
- Strong TypeScript support for type-safe translations
- Active maintenance and large community

### Alternatives Considered
- **next-i18next**:
  - Pros: Mature, widely adopted, proven at scale
  - Cons: Primarily designed for Pages Router, requires workarounds for App Router
  - Verdict: Not ideal for App Router-first architecture

- **react-intl**:
  - Pros: Framework-agnostic, widely used
  - Cons: Requires manual routing setup, no built-in Next.js optimizations
  - Verdict: Too much manual configuration for this use case

### Implementation Notes
- Use middleware for language detection from Accept-Language header
- Configure `[lang]` dynamic segment in app router structure
- Leverage `getRequestConfig` for async message loading
- Use `unstable_setRequestLocale` in layouts for static rendering optimization

### References
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

## 2. Python Backend Framework Selection

### Decision
Use **FastAPI** for the backend API layer

### Rationale
- **Type Safety**: Native Pydantic integration provides automatic validation and serialization
- **Clean Architecture Support**: Easy to implement dependency injection for repositories and use cases
- **Performance**: Async/await support with high performance (comparable to Node.js/Go)
- **OpenAPI Integration**: Automatic OpenAPI schema generation from type hints
- **Modern Python**: Leverages Python 3.11+ features including type hints
- **Developer Experience**: Interactive Swagger UI and ReDoc out of the box

### Alternatives Considered
- **Django + Django REST Framework**:
  - Pros: Mature ecosystem, admin panel, ORM
  - Cons: Heavier framework, more opinionated, slower for API-only workloads
  - Verdict: Overkill for API-first architecture; admin panel not needed (using Strapi CMS)

- **Flask**:
  - Pros: Lightweight, flexible
  - Cons: Requires many extensions, no built-in async support, manual OpenAPI generation
  - Verdict: Too minimal, would require significant setup for production-ready API

### Implementation Notes
- Use FastAPI dependency injection for Clean Architecture (repositories, use cases)
- Leverage Pydantic models for request/response validation
- Implement async database operations with SQLAlchemy 2.0 or Tortoise ORM
- Use FastAPI middleware for CORS, caching headers, language detection

### References
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FastAPI Clean Architecture Example](https://github.com/zhanymkanov/fastapi-best-practices)

---

## 3. Strapi Multi-Language Content Modeling

### Decision
Use **Strapi's native i18n plugin** with customizations for partial translations

### Rationale
- Built-in support for multiple locales with fallback mechanism
- Admin UI provides locale switcher for editors (non-technical friendly)
- API supports locale filtering (`?locale=it`)
- Can configure default locale and fallback behavior per content type
- Supports partial translations (some locales published, others draft)

### Alternatives Considered
- **Custom Implementation (separate collections per language)**:
  - Pros: Full control over data structure
  - Cons: Complex to maintain, no admin UI support, manual relationship management
  - Verdict: Reinventing the wheel, high maintenance burden

- **Translation Plugin (third-party)**:
  - Pros: Additional features like translation memory
  - Cons: Less mature, potential compatibility issues, vendor lock-in
  - Verdict: Not worth the risk for MVP

### Implementation Notes
- Enable i18n plugin globally: `strapi.plugins['i18n']`
- Configure content types with `pluginOptions: { i18n: { localized: true } }`
- Set default locale to English (`en`)
- Configure fallback: `it` → `en`, `he` → `en`
- Use `populate` parameter to fetch all locales for hreflang generation
- Create custom admin panel field to show translation status per locale

### References
- [Strapi i18n Plugin](https://docs.strapi.io/dev-docs/plugins/i18n)
- [Strapi Content Types](https://docs.strapi.io/dev-docs/backend-customization/models)

---

## 4. RTL Layout Implementation

### Decision
Use **Tailwind CSS with RTL plugin** for right-to-left Hebrew layouts

### Rationale
- `tailwindcss-rtl` plugin provides automatic RTL variants for all utilities
- Use `dir="rtl"` on `<html>` tag for Hebrew pages
- Tailwind's `rtl:` prefix enables conditional RTL styles (e.g., `rtl:mr-4 ltr:ml-4`)
- Consistent with overall styling approach (Tailwind for utility-first CSS)
- Minimal JavaScript required (just toggle `dir` attribute)
- Works seamlessly with Next.js App Router layouts

### Alternatives Considered
- **CSS-in-JS (styled-components/emotion)**:
  - Pros: Dynamic styling, programmatic control
  - Cons: Runtime overhead, harder to optimize, less performant than Tailwind
  - Verdict: Performance penalty not acceptable for <3s load time target

- **Manual CSS with logical properties**:
  - Pros: No dependencies, full control
  - Cons: Verbose, error-prone, hard to maintain across components
  - Verdict: Too much manual work for a solved problem

### Implementation Notes
- Install `tailwindcss-rtl` plugin
- Add `dir` attribute to `<html>` based on current language:
  ```tsx
  <html lang={lang} dir={lang === 'he' ? 'rtl' : 'ltr'}>
  ```
- Use logical properties where possible: `ms-4` (margin-start) instead of `ml-4`
- Test all components in both LTR and RTL modes
- Mirror icons/images using Tailwind's `rtl:scale-x-[-1]`

### References
- [tailwindcss-rtl Plugin](https://github.com/20lives/tailwindcss-rtl)
- [MDN: CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)

---

## 5. SEO Optimization for Multi-Language Sites

### Decision
Implement **hreflang tags with x-default** + **language-specific sitemaps** + **structured data per language**

### Rationale
- Google's recommended approach for multi-regional/multi-language sites
- `x-default` on English version (root domain) for unmatched languages
- Separate sitemaps improve crawl efficiency (sitemap.xml, sitemap-it.xml, sitemap-il.xml)
- Structured data (schema.org JSON-LD) in matching language improves rich snippets
- Each language version has its own canonical URL (no cross-language canonicals)

### Alternatives Considered
- **Single sitemap with all languages**:
  - Pros: Simpler to maintain
  - Cons: Harder for search engines to parse language signals, less efficient crawling
  - Verdict: Not optimal for SEO

- **Language subdomains (it.affilibuster.com)**:
  - Pros: Clear separation, easier CDN configuration
  - Cons: Requires SSL certs per subdomain, more complex DNS, splits domain authority
  - Verdict: URL paths (/it, /he) are simpler and maintain domain authority

### Implementation Notes
- Generate hreflang tags in Next.js layout:
  ```tsx
  <link rel="alternate" hreflang="x-default" href={`${domain}${enPath}`} />
  <link rel="alternate" hreflang="it" href={`${domain}${itPath}`} />
  <link rel="alternate" hreflang="he" href={`${domain}${ilPath}`} />
  ```
- Use `next-seo` package for managing SEO meta tags
- Generate sitemaps dynamically via API route: `/api/sitemap-[lang].xml`
- Include `<loc>`, `<lastmod>`, `<changefreq>` in sitemap entries
- Add schema.org `WebPage` + `Organization` JSON-LD with `inLanguage` property

### References
- [Google Multi-Regional SEO](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [hreflang Best Practices](https://ahrefs.com/blog/hreflang-tags/)

---

## 6. Currency Handling and Formatting

### Decision
Use **Intl.NumberFormat** (native JavaScript API) for currency formatting

### Rationale
- Built into JavaScript (Node.js 18+, all modern browsers)
- Zero dependencies, no bundle size increase
- Locale-aware formatting (symbol position, decimal separator, thousands separator)
- Supports 150+ currencies out of the box
- High performance (native C++ implementation)
- TypeScript-friendly

### Alternatives Considered
- **dinero.js**:
  - Pros: Precise arithmetic (avoids floating point errors), money object abstraction
  - Cons: 8KB bundle size, overkill for display-only formatting
  - Verdict: Unnecessary for this use case (no complex calculations)

- **currency.js**:
  - Pros: Lightweight (5KB), simple API
  - Cons: Still an external dependency, Intl.NumberFormat is sufficient
  - Verdict: Not worth the dependency

### Implementation Notes
- Create utility function:
  ```typescript
  function formatCurrency(amount: number, currency: string, locale: string) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  ```
- Store prices in cents (integers) in database to avoid floating point errors
- Convert to decimal for display only
- Cache user's currency preference in Redis with 30-day TTL

### References
- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Intl Explorer](https://www.intl-explorer.com/)

---

## 7. Caching Strategy for User Preferences

### Decision
Use **Redis with session-based keys** for currency and language preferences

### Rationale
- Fast in-memory lookups (<1ms latency)
- Built-in TTL (time-to-live) for automatic expiration
- Supports atomic operations for race condition handling
- Easy to scale horizontally (Redis Cluster)
- Works for both anonymous (sessionId) and logged-in users (userId)
- Vercel KV (Redis) available on platform

### Alternatives Considered
- **Browser localStorage only**:
  - Pros: No server required, instant access
  - Cons: Lost on device change, can't be read server-side for SSR
  - Verdict: Not sufficient for SSR/SSG pages

- **PostgreSQL session table**:
  - Pros: Persistent, relational data
  - Cons: Slower than Redis, unnecessary persistence for ephemeral preferences
  - Verdict: Overkill for short-term session data

- **Cookie-based storage**:
  - Pros: Sent with every request, works with SSR
  - Cons: Increases request size, 4KB limit, security concerns
  - Verdict: Acceptable for language preference only, not ideal for all preferences

### Implementation Notes
- Key structure: `session:{sessionId}:preferences`
- TTL: 30 days for inactive sessions
- Data structure:
  ```json
  {
    "currency": "USD",
    "dismissedLanguagePrompt": true,
    "detectedLanguage": "it",
    "createdAt": "2025-10-04T10:00:00Z"
  }
  ```
- Use Redis `SETEX` for atomic set-with-expiry
- Fallback to defaults if key doesn't exist
- Language preference also stored in cookie for SSR (lightweight, 2 bytes)

### References
- [Vercel KV (Redis)](https://vercel.com/docs/storage/vercel-kv)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

---

## 8. Static Generation vs ISR Trade-offs

### Decision
Use **SSG (Static Site Generation) for most pages** + **ISR (Incremental Static Regeneration) for CMS content** with 60-second revalidation

### Rationale
- SSG for maximum performance: Language switcher, currency selector, static pages (about, contact)
- ISR for CMS content: Product pages, blog posts (updated by editors)
- 60-second revalidation balances freshness with build performance
- Stale-while-revalidate pattern ensures users never wait for rebuilds
- Reduces build times (no need to rebuild all pages on every CMS update)

### Alternatives Considered
- **Full SSG (rebuild on every change)**:
  - Pros: Always fresh, simplest mental model
  - Cons: Long build times as content grows, unnecessary rebuilds for unchanged pages
  - Verdict: Not scalable for 100+ pages per language

- **Client-Side Rendering (CSR)**:
  - Pros: Always fresh, no build step
  - Cons: SEO issues, slower initial load, poor Lighthouse scores
  - Verdict: Violates <3s load time and SEO requirements

- **Server-Side Rendering (SSR)**:
  - Pros: Always fresh, good SEO
  - Cons: Higher latency (database query per request), higher server costs
  - Verdict: Unnecessary for mostly static content

### Implementation Notes
- Configure Next.js pages:
  ```tsx
  // Static pages (e.g., language switcher, footer)
  export const dynamic = 'force-static';

  // CMS content pages (e.g., products, blog)
  export const revalidate = 60; // ISR with 60s revalidation
  ```
- Use `generateStaticParams` to pre-generate common pages at build time
- Implement on-demand revalidation via webhook: CMS triggers `/api/revalidate?path=/it/prodotti/eco-bottle`
- Cache API responses in Next.js Data Cache for additional performance

### References
- [Next.js ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#revalidating-data)
- [On-Demand Revalidation](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#on-demand-revalidation)

---

## Summary

All technical decisions have been validated and documented. Key takeaways:

1. **Frontend**: Next.js 14 (App Router) + next-intl + Tailwind CSS (with RTL plugin)
2. **Backend**: FastAPI + Pydantic + SQLAlchemy/Tortoise (async)
3. **CMS**: Strapi with native i18n plugin
4. **Database**: PostgreSQL (all services)
5. **Caching**: Redis (user preferences, session data)
6. **SEO**: hreflang tags, language-specific sitemaps, schema.org markup
7. **Performance**: SSG for static, ISR (60s revalidation) for CMS content
8. **Currency**: Intl.NumberFormat (native, zero dependencies)

These decisions support:
- ✅ Clean Architecture (FastAPI DI, domain-driven design)
- ✅ Performance targets (<3s load, Lighthouse >90)
- ✅ SEO requirements (hreflang, schema, sitemaps)
- ✅ Multi-language support (3 languages, RTL, locale formatting)
- ✅ API-first design (OpenAPI contracts, versioned endpoints)
- ✅ Reusability (modular components, config-driven)

---

**Status**: Phase 0 Research Complete ✅
**Next**: Phase 1 - Design & Contracts
