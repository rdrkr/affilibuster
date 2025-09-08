# Quickstart: Multi-Language Platform

**Feature**: Core Platform Setup & Multi-Language Infrastructure
**Date**: 2025-10-04

## Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+ and pip
- PostgreSQL 15+
- Redis (or Vercel KV for production)
- Git

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-org/affilibuster.git
cd affilibuster

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cd ..

# Install CMS dependencies
cd cms
npm install
cd ..
```

### 2. Configure Environment

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/v1
NEXT_PUBLIC_DOMAIN=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/affilibuster
REDIS_URL=redis://localhost:6379

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/affilibuster
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:3000,http://localhost:1337
JWT_SECRET=your-secret-key

# CMS (.env)
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=affilibuster_cms
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
JWT_SECRET=your-secret-key
ADMIN_JWT_SECRET=your-admin-secret
```

### 3. Database Setup

```bash
# Create databases
createdb affilibuster
createdb affilibuster_cms

# Run migrations
cd backend
alembic upgrade head
cd ..

# Seed data (languages, currencies, locales)
cd backend
python scripts/seed.py
cd ..
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend API
cd backend
uvicorn src.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: CMS
cd cms
npm run develop
```

---

## Verification Tests

### Test 1: Language Detection & Prompt

**Objective**: Verify browser language detection and prompt display

**Steps**:
1. Set browser language to Italian (Chrome: Settings → Languages → Add Italian, move to top)
2. Open new incognito window
3. Navigate to `http://localhost:3000`
4. **✅ Verify**: Non-intrusive prompt appears with Italian text:
   - "Vuoi passare alla versione italiana?"
   - "Sì" and "No" buttons visible
5. Click "Sì"
6. **✅ Verify**: Browser redirects to `http://localhost:3000/it`
7. **✅ Verify**: UI text displays in Italian
8. **✅ Verify**: HTML has `<html lang="it">`

**Expected Result**: ✅ Language detection works, prompt shows, redirect successful

---

### Test 2: Manual Language Switching

**Objective**: Verify language switcher component works across all languages

**Steps**:
1. Navigate to `http://localhost:3000/products/eco-bottle`
2. Locate language selector in navigation
3. Click language selector
4. **✅ Verify**: Dropdown shows all 3 languages:
   - English (current, checkmark)
   - Italiano
   - עברית
5. Select "עברית" (Hebrew)
6. **✅ Verify**: Redirects to `http://localhost:3000/il/products/eco-bottle`
7. **✅ Verify**: Layout switches to RTL (`dir="rtl"` on `<html>`)
8. **✅ Verify**: UI text in Hebrew
9. **✅ Verify**: Navigation items mirrored (right-aligned)
10. Go back to English, select "Italiano"
11. **✅ Verify**: Redirects to `http://localhost:3000/it/prodotti/bottiglia-eco`
    - Note: Slug translated to Italian

**Expected Result**: ✅ Language switcher works for all 3 languages, RTL applied for Hebrew

---

### Test 3: Currency Selection & Persistence

**Objective**: Verify currency selector and cross-language persistence

**Steps**:
1. Navigate to `http://localhost:3000/it` (Italian site)
2. Find a product page with prices
3. **✅ Verify**: Prices display in EUR (default for Italian): "27,50 €"
4. Open currency selector (usually in header or footer)
5. Select "USD"
6. **✅ Verify**: Prices update to USD format: "$29.99"
7. Switch language to Hebrew (`/il`)
8. **✅ Verify**: Prices STILL show in USD (preference persisted)
9. Open DevTools → Application → Cookies
10. **✅ Verify**: Cookie or session storage contains `selectedCurrency: USD`
11. Close browser, reopen, navigate to `/it` again
12. **✅ Verify**: Prices still in USD (30-day persistence)

**Expected Result**: ✅ Currency selection persists across language switches and browser sessions

---

### Test 4: SEO Meta Tags & hreflang

**Objective**: Verify SEO requirements (hreflang, canonical, schema)

**Steps**:
1. Navigate to `http://localhost:3000/it/prodotti/bottiglia-eco`
2. Right-click → "View Page Source"
3. **✅ Verify**: `<html lang="it">`
4. **✅ Verify**: hreflang tags present:
   ```html
   <link rel="alternate" hreflang="x-default" href="http://localhost:3000/products/eco-bottle" />
   <link rel="alternate" hreflang="it" href="http://localhost:3000/it/prodotti/bottiglia-eco" />
   <link rel="alternate" hreflang="he" href="http://localhost:3000/il/products/eco-bottle" />
   ```
5. **✅ Verify**: Canonical URL points to current page:
   ```html
   <link rel="canonical" href="http://localhost:3000/it/prodotti/bottiglia-eco" />
   ```
6. **✅ Verify**: Schema markup in Italian (JSON-LD):
   ```json
   {
     "@context": "https://schema.org",
     "@type": "WebPage",
     "name": "Bottiglia Ecologica",
     "inLanguage": "it"
   }
   ```
7. **✅ Verify**: Meta tags in Italian:
   ```html
   <title>Bottiglia Ecologica | Affilibuster</title>
   <meta name="description" content="..." />
   ```

**Expected Result**: ✅ All SEO tags present and correctly localized

---

### Test 5: URL Redirects (301 & 410)

**Objective**: Verify redirect handling for slug changes and content deletion

**Steps - 301 Redirect (Slug Change)**:
1. In CMS (`http://localhost:1337/admin`), login as admin
2. Navigate to Content → Products → "Eco Bottle"
3. Change English slug from `eco-bottle` to `eco-water-bottle`
4. Save and publish
5. Navigate to old URL: `http://localhost:3000/products/eco-bottle`
6. **✅ Verify**: 301 redirect to `http://localhost:3000/products/eco-water-bottle`
7. **✅ Verify**: Content displays correctly at new URL

**Steps - 410 Gone (Content Deletion)**:
1. In CMS, find a test product (e.g., "Test Product IT")
2. Note its Italian URL: `/it/prodotti/test-product`
3. Delete the Italian version only (keep English)
4. Navigate to deleted URL: `http://localhost:3000/it/prodotti/test-product`
5. **✅ Verify**: 410 Gone status
6. **✅ Verify**: Custom 410 page displays in Italian:
   - "Questo contenuto non è più disponibile"
   - Link back to homepage

**Expected Result**: ✅ 301 redirects work for slug changes, 410 for deletions

---

### Test 6: Content Fallback to English

**Objective**: Verify fallback when translation missing

**Steps**:
1. In CMS, create a new product: "New Eco Gadget"
2. Publish ONLY English version (don't translate to Italian or Hebrew)
3. Navigate to English: `http://localhost:3000/products/new-eco-gadget`
4. **✅ Verify**: Content displays in English
5. Switch to Italian site: `http://localhost:3000/it`
6. Try to access: `http://localhost:3000/it/products/new-eco-gadget`
7. **✅ Verify**:
   - Page renders (not 404)
   - UI/navigation in Italian
   - Content body in English (fallback)
   - Notice displayed: "This content is not yet available in Italian"
8. Switch to Hebrew: `http://localhost:3000/il/products/new-eco-gadget`
9. **✅ Verify**: Same behavior (UI in Hebrew, content in English)

**Expected Result**: ✅ Graceful fallback to English when translation missing

---

## Performance Validation

### Lighthouse Audits

Run Lighthouse on all language versions:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Audit English (root)
lighthouse http://localhost:3000 --output html --output-path ./reports/lighthouse-en.html

# Audit Italian
lighthouse http://localhost:3000/it --output html --output-path ./reports/lighthouse-it.html

# Audit Hebrew
lighthouse http://localhost:3000/il --output html --output-path ./reports/lighthouse-il.html
```

**✅ Verify for ALL languages**:
- Performance score: **>90**
- Accessibility score: **>90**
- Best Practices score: **>90**
- SEO score: **100**

### Performance Metrics (3G Throttling)

1. Open Chrome DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Hard reload (Cmd+Shift+R / Ctrl+Shift+R)
4. **✅ Verify**:
   - LCP (Largest Contentful Paint): **<2.5s**
   - FCP (First Contentful Paint): **<1.8s**
   - TTFB (Time to First Byte): **<600ms**
   - Page fully loaded: **<3s**

**Expected Result**: ✅ All performance targets met on 3G

---

## API Testing

### Manual API Tests

```bash
# Test 1: Get languages
curl http://localhost:8000/v1/languages | jq

# Expected: Array of 3 languages (en, it, he)

# Test 2: Detect language (Italian browser)
curl -X POST http://localhost:8000/v1/languages/detect \
  -H "Content-Type: application/json" \
  -d '{"acceptLanguage": "it-IT,it;q=0.9,en;q=0.8"}' | jq

# Expected: {"detectedLanguage": "it", "confidence": 0.9, "shouldPrompt": true}

# Test 3: Get content (Italian)
curl http://localhost:8000/v1/content/it/bottiglia-eco | jq

# Expected: Italian content with SEO metadata

# Test 4: Convert currency
curl -X POST http://localhost:8000/v1/currencies/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 29.99, "fromCurrency": "USD", "toCurrency": "EUR", "locale": "it-IT"}' | jq

# Expected: {"amount": 27.50, "currency": "EUR", "formatted": "27,50 €"}

# Test 5: Get user preferences
curl http://localhost:8000/v1/user/preferences \
  -H "X-Session-Id: test-session-123" | jq

# Expected: User preferences or 404 (create with PUT)

# Test 6: Update preferences
curl -X PUT http://localhost:8000/v1/user/preferences \
  -H "X-Session-Id: test-session-123" \
  -H "Content-Type: application/json" \
  -d '{"selectedCurrency": "EUR", "dismissedLanguagePrompt": true}' | jq

# Expected: Updated preferences with 30-day expiry
```

---

## Troubleshooting

### Issue: Language prompt not showing
- **Check**: Browser language settings (must be it or he, not en)
- **Check**: Session storage for `dismissedLanguagePrompt` (clear if true)
- **Check**: URL (prompt only shows on root domain, not /it or /il)

### Issue: RTL layout not working for Hebrew
- **Check**: HTML source for `dir="rtl"` attribute
- **Check**: Tailwind RTL plugin installed (`npm ls tailwindcss-rtl`)
- **Check**: Browser DevTools → Elements → `<html>` tag

### Issue: Currency not persisting
- **Check**: Redis running (`redis-cli ping` should return `PONG`)
- **Check**: API response includes `expiresAt` field (30 days from now)
- **Check**: Browser cookies/session storage

### Issue: hreflang tags missing
- **Check**: Content exists in all languages (query CMS)
- **Check**: `alternateUrls` field in API response
- **Check**: Next.js `Head` component rendering logic

### Issue: 404 instead of 410 on deleted content
- **Check**: URLRedirect table has entry with `statusCode = 410`
- **Check**: API `/content/{lang}/{slug}` returns 410 (not 404)
- **Check**: Next.js custom error page for 410 status

---

## Success Criteria

All tests pass ✅:

1. **Multi-Language**:
   - ✅ Language detection and prompt work
   - ✅ Manual switching works for all 3 languages
   - ✅ RTL layout applies for Hebrew
   - ✅ Content fallback to English when translation missing

2. **Currency**:
   - ✅ Currency selector updates prices
   - ✅ Preference persists across languages and sessions

3. **SEO**:
   - ✅ hreflang tags on all pages
   - ✅ Canonical URLs correct
   - ✅ Schema markup in correct language
   - ✅ 301 redirects for slug changes
   - ✅ 410 status for deleted content

4. **Performance**:
   - ✅ Lighthouse scores >90 (all languages)
   - ✅ Page load <3s on 3G
   - ✅ LCP <2.5s, FCP <1.8s

5. **API**:
   - ✅ All endpoints return expected data
   - ✅ OpenAPI contract validation passes

---

**Status**: Quickstart Guide Complete ✅
**Next**: Run `/tasks` command to generate implementation tasks
