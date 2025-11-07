<!-- Copyright (c) 2025 Affilibuster by Ronen Druker. -->

# Affilibuster Product Roadmap

**Last Updated**: 2025-11-07
**Version**: 1.0.0

This document outlines missing features and capabilities identified through comprehensive code analysis against
requirements documented in:

- Constitution (`.specify/memory/constitution.md`)
- Product Requirements Document (`docs/eco-friendly-affiliate-website-prd.md`)
- Feature Specifications (`specs/` folder)

## Status Legend

- 🔴 **Not Started** - Feature not implemented
- 🟡 **Partial** - Partially implemented, needs completion
- 🟢 **Complete** - Fully implemented and tested
- ⚠️ **Blocked** - Blocked by dependencies or decisions

---

## 1. Core Content & Product Features

### 1.1 Product Content Types - 🟡 Partial

**Current State**: Basic product content type exists with title, description, price, affiliate URL, category (string),
currency, featured flag.

**Missing**:

- [ ] Product images/gallery fields
- [ ] Eco-certifications field (array/relation)
- [ ] Material field (e.g., organic cotton, bamboo, recycled plastic)
- [ ] Sustainability features field (e.g., carbon neutral, fair trade, biodegradable)
- [ ] Brand field (string or relation to Brand content type)
- [ ] Dimensions/specifications field
- [ ] Weight field (for shipping calculations)
- [ ] Stock status field
- [ ] SKU field
- [ ] Product tags/labels (e.g., "Best Seller", "New Arrival")

**Priority**: High
**Impact**: Essential for eco-friendly affiliate website value proposition
**Reference**: PRD Section 1 (Core Page Types), PRD Section 2 (Product Review/Details Pages)

### 1.2 Reviews & Ratings System - 🔴 Not Started

**Current State**: No reviews or ratings implementation in CMS, backend, or frontend.

**Missing**:

- [ ] Review content type (reviewer name, rating, review text, verified purchase flag, date)
- [ ] Rating aggregation logic (average rating, total reviews)
- [ ] Review moderation system
- [ ] User-generated review submission (requires authentication)
- [ ] Editorial review vs user review distinction
- [ ] Review helpfulness voting
- [ ] Display reviews on product detail pages
- [ ] Review schema markup for SEO
- [ ] Review filtering/sorting (most helpful, newest, highest/lowest rating)

**Priority**: High
**Impact**: Critical for building trust and helping users make informed decisions
**Reference**: PRD Section 2 (Review & Rating System), Constitution Principle VII (Schema markup for reviews)

### 1.3 Category System - 🔴 Not Started

**Current State**: Product has a simple string category field. No category content type, no category pages.

**Missing**:

- [ ] Category content type (name, slug, description, image, parent category for hierarchy)
- [ ] Category relation in Product (many-to-many)
- [ ] Category listing pages (`/[lang]/categories`)
- [ ] Category detail pages (`/[lang]/category/[slug]`)
- [ ] Product filtering by category
- [ ] Category hierarchy/tree navigation
- [ ] Breadcrumb navigation showing category path
- [ ] Category-specific SEO metadata
- [ ] Category schema markup

**Priority**: High
**Impact**: Required for product organization and navigation
**Reference**: PRD Section 1 (Category Pages)

### 1.4 Blog/Content Pages - 🔴 Not Started

**Current State**: No blog, article, or editorial content system exists.

**Missing**:

- [ ] Article/Blog Post content type (title, slug, content, excerpt, author, publish date, tags)
- [ ] Blog listing page (`/[lang]/blog`)
- [ ] Article detail pages (`/[lang]/blog/[slug]`)
- [ ] Article categories/tags
- [ ] Author profiles
- [ ] Related articles
- [ ] Article schema markup
- [ ] RSS feed for articles
- [ ] Article search
- [ ] Reading time estimate

**Priority**: Medium-High
**Impact**: Essential for SEO traffic generation and establishing expertise
**Reference**: PRD Section 1 (Blog / Content Pages), PRD Section 4 (SEO Blog Content)

---

## 2. Search & Filtering

### 2.1 Product Search - 🔴 Not Started

**Current State**: No search functionality exists anywhere in the application.

**Missing**:

- [ ] Search API endpoint (backend)
- [ ] Search indexing strategy (full-text search in PostgreSQL or external service)
- [ ] Search UI component (search box with auto-suggestions)
- [ ] Search results page
- [ ] Search highlighting
- [ ] Search analytics/tracking (popular searches, no-results searches)
- [ ] Search filters integration
- [ ] Multi-language search support
- [ ] Search ranking algorithm (relevance, popularity, etc.)

**Priority**: High
**Impact**: Critical for user experience and product discoverability
**Reference**: PRD Section 2 (Search and Smart Filters)

### 2.2 Smart Filters - 🔴 Not Started

**Current State**: No filtering beyond basic pagination and language.

**Missing**:

- [ ] Price range filter (min/max)
- [ ] Category filter (multi-select)
- [ ] Brand filter (multi-select)
- [ ] Eco-certification filter (multi-select)
- [ ] Material filter (multi-select)
- [ ] Rating filter (minimum rating)
- [ ] Availability filter (in stock, out of stock)
- [ ] Sort options (price low-to-high, high-to-low, newest, popularity, rating)
- [ ] Filter UI components (checkboxes, sliders, dropdowns)
- [ ] Active filters display (chips/tags)
- [ ] Clear all filters button
- [ ] Filter persistence in URL (deep linking)
- [ ] Filter count display (showing # of results per filter option)

**Priority**: High
**Impact**: Essential for product discovery and user experience
**Reference**: PRD Section 2 (Search and Smart Filters)

---

## 3. E-commerce & Conversion Features

### 3.1 Bundle/Kit Recommendations - 🔴 Not Started

**Current State**: No bundle or product recommendation system exists.

**Missing**:

- [ ] Bundle content type (title, description, products relation, price, savings)
- [ ] Manual bundle creation in CMS
- [ ] Related products logic (manually curated or algorithm-based)
- [ ] "Frequently bought together" component
- [ ] Bundle display on product pages
- [ ] Bundle landing pages
- [ ] Bundle schema markup

**Priority**: Medium
**Impact**: Increases average order value and provides better user experience
**Reference**: PRD Section 2 (Bundle/Kit Recommendations), PRD Section 5 (Future: Bundle Purchase System)

### 3.2 Currency Conversion - 🔴 Not Started

**Current State**: Currency selector exists, prices display in selected currency, but NO actual conversion occurs.
Prices are stored in single currency only.

**Missing**:

- [ ] Exchange rate API integration (EXCHANGE_RATE_API_KEY exists in env but unused)
- [ ] Exchange rate caching strategy
- [ ] Real-time or daily currency conversion
- [ ] Price conversion logic in backend
- [ ] Historical rate storage for consistent pricing
- [ ] Fallback when conversion API unavailable
- [ ] Currency conversion disclosure ("Prices converted from USD at rate X")

**Priority**: High
**Impact**: Required functional requirement from spec 001 (FR-011 to FR-014)
**Reference**: Spec 001 FR-011 through FR-014

### 3.3 Affiliate Link Tracking & Management - 🟡 Partial

**Current State**: Products have affiliate URL field. No tracking, no click analytics, no management dashboard.

**Missing**:

- [ ] Click tracking system (record affiliate link clicks)
- [ ] Click-to-conversion tracking (if possible with affiliate networks)
- [ ] Affiliate performance dashboard (clicks, conversions, revenue by product)
- [ ] Link health checker (check if affiliate links are still valid)
- [ ] A/B testing for different affiliate URLs
- [ ] Deep link generation for mobile apps
- [ ] Affiliate disclosure automation
- [ ] Commission tracking integration

**Priority**: Medium-High
**Impact**: Critical for business metrics and optimization
**Reference**: PRD Section 4 (Affiliate Link Management, Click & Conversion Tracking)

---

## 4. User Engagement & Personalization

### 4.1 Email Newsletter/Subscribe - 🔴 Not Started

**Current State**: No email collection, no newsletter functionality.

**Missing**:

- [ ] Email subscription form component
- [ ] Newsletter subscriber content type / email list management
- [ ] Email service provider integration (Mailchimp, SendGrid, etc.)
- [ ] Subscription confirmation (double opt-in)
- [ ] Unsubscribe mechanism
- [ ] Privacy policy compliance (GDPR consent)
- [ ] Welcome email automation
- [ ] Newsletter templates
- [ ] Subscription popups/modals (exit intent, time-based, scroll-based)

**Priority**: Medium
**Impact**: Important for building audience and marketing channel
**Reference**: PRD Section 2 (Popups/Email subscribe blocks)

### 4.2 Personalization Engine - 🔴 Not Started

**Current State**: Only language and currency preferences are tracked. No behavior-based personalization.

**Missing**:

- [ ] User behavior tracking (views, clicks, time spent)
- [ ] Recommendation algorithm (collaborative filtering, content-based)
- [ ] Recently viewed products
- [ ] Personalized homepage
- [ ] Personalized product recommendations
- [ ] Email personalization
- [ ] A/B testing framework
- [ ] Anonymous user tracking (cookieless where possible)

**Priority**: Low-Medium (Future Enhancement)
**Impact**: Improves user experience and conversion rates
**Reference**: PRD Section 2 (Personalization Engine - Future), PRD Section 4

### 4.3 User Authentication & Login - 🔴 Not Started

**Current State**: No authentication system. Everything is anonymous/guest-based.

**Missing**:

- [ ] User registration system
- [ ] Login/logout functionality
- [ ] Password reset flow
- [ ] Social login (Google, Facebook, etc.)
- [ ] User profile management
- [ ] Saved products/wish list
- [ ] Order history (if applicable)
- [ ] User preferences persistence across devices
- [ ] Email verification
- [ ] Two-factor authentication (2FA)

**Priority**: Low-Medium (Future Enhancement)
**Impact**: Enables user-specific features but not critical for MVP
**Reference**: PRD Section 2 (Login Area - can be built after)

---

## 5. SEO & Performance

### 5.1 Schema Markup Enhancement - 🟡 Partial

**Current State**: Basic Product and Article schema exists, but missing critical fields.

**Missing**:

- [ ] Product schema: `price`, `priceCurrency`, `availability`, `brand`, `image`, `sku`, `aggregateRating`
- [ ] Review schema: `Review` and `AggregateRating` types
- [ ] Breadcrumb schema: `BreadcrumbList` for navigation
- [ ] Organization schema: Site-wide organization information
- [ ] FAQ schema: For FAQ pages/sections
- [ ] How-to schema: For guides/tutorials
- [ ] Video schema: If video content added
- [ ] LocalBusiness schema: If physical location relevant

**Priority**: High
**Impact**: Critical for rich snippets and SEO visibility
**Reference**: Constitution Principle VII, PRD Section 4 (Schema markup)

### 5.2 Automatic 301/410 Redirects - 🟡 Partial

**Current State**: 410 content type and API exist. No automatic redirect creation on slug changes or page deletion.

**Missing**:

- [ ] Redirect content type (old URL, new URL, redirect type 301/410, created date)
- [ ] Automatic 301 creation when slug changes (requires CMS lifecycle hooks)
- [ ] Automatic 410 creation when content deleted (requires CMS lifecycle hooks)
- [ ] Redirect middleware in frontend (Next.js middleware or API route)
- [ ] Redirect management UI in CMS
- [ ] Redirect validation (prevent redirect loops)
- [ ] Redirect analytics (404 tracking)
- [ ] Bulk redirect import/export

**Priority**: Medium-High
**Impact**: Required for SEO, prevents broken links
**Reference**: Spec 001 FR-018, Constitution Principle VII

### 5.3 Breadcrumb Navigation - 🔴 Not Started

**Current State**: No breadcrumb navigation exists.

**Missing**:

- [ ] Breadcrumb component (frontend)
- [ ] Breadcrumb data structure in CMS content types
- [ ] Dynamic breadcrumb generation based on page hierarchy
- [ ] Breadcrumb schema markup (`BreadcrumbList`)
- [ ] Breadcrumb styling (mobile, desktop, RTL)
- [ ] Breadcrumb customization per page

**Priority**: Medium
**Impact**: Improves navigation and SEO
**Reference**: Constitution Principle VII, PRD Section 1

### 5.4 Image Optimization - 🟡 Partial

**Current State**: Next.js Image component used in some places, but not consistently. No WebP enforcement.

**Missing**:

- [ ] Consistent use of Next.js Image component everywhere
- [ ] WebP format enforcement in CMS (convert uploads to WebP)
- [ ] Responsive image srcsets
- [ ] Image lazy loading (beyond default Next.js behavior)
- [ ] Eager loading for above-the-fold images
- [ ] Image compression pipeline
- [ ] Alt text enforcement in CMS
- [ ] Image CDN configuration

**Priority**: High
**Impact**: Critical for performance and SEO
**Reference**: Constitution Principle VII (Image optimization)

### 5.5 Critical CSS Inlining - 🟡 Partial

**Current State**: Tailwind CSS used, but unclear if critical CSS is truly inlined.

**Missing**:

- [ ] Verify critical CSS inlining for above-the-fold content
- [ ] CSS splitting strategy
- [ ] Non-critical CSS lazy loading
- [ ] CSS bundle size monitoring

**Priority**: Medium
**Impact**: Improves initial page load performance
**Reference**: Constitution Principle VII

### 5.6 Performance Monitoring - 🔴 Not Started

**Current State**: No performance monitoring or analytics.

**Missing**:

- [ ] Lighthouse CI integration
- [ ] Core Web Vitals monitoring
- [ ] Real User Monitoring (RUM)
- [ ] Performance budget enforcement
- [ ] Bundle size tracking
- [ ] Load time tracking per route
- [ ] Performance regression alerts

**Priority**: Medium
**Impact**: Ensures performance standards are maintained
**Reference**: Constitution Principle VII

---

## 6. Analytics & Tracking

### 6.1 Google Analytics / Tag Manager - 🟡 Partial

**Current State**: Environment variables for GA_ID and GTM_ID exist, but no actual implementation.

**Missing**:

- [ ] Google Analytics 4 integration
- [ ] Google Tag Manager integration
- [ ] Event tracking setup (clicks, form submissions, affiliate link clicks)
- [ ] E-commerce event tracking (view product, add to cart, purchase)
- [ ] Custom dimensions (user properties, content attributes)
- [ ] Conversion tracking
- [ ] Cookie consent integration (GDPR compliance)
- [ ] Analytics dashboard/reporting

**Priority**: High
**Impact**: Essential for business intelligence and optimization
**Reference**: PRD Section 4 (Integration with Google Analytics)

### 6.2 Search Console Integration - 🔴 Not Started

**Current State**: No Search Console integration or monitoring.

**Missing**:

- [ ] Google Search Console verification
- [ ] Search query data integration
- [ ] Index coverage monitoring
- [ ] Crawl error tracking
- [ ] Manual action alerts
- [ ] Rich result status monitoring

**Priority**: Medium
**Impact**: Important for SEO monitoring and issue detection
**Reference**: PRD Section 4

---

## 7. Testing & Quality Assurance

### 7.1 Test Coverage - 🟡 Partial

**Current State**: Backend at 100%, Frontend at 15%, CMS has no tests.

**Missing**:

- [ ] Increase frontend test coverage to 80% minimum
- [ ] Add CMS tests (at least 60-80%)
- [ ] Integration tests between modules
- [ ] Contract tests for APIs
- [ ] E2E tests with Playwright (basic setup exists but minimal coverage)
- [ ] Visual regression tests
- [ ] Accessibility tests (automated with axe-core)

**Priority**: High
**Impact**: Required per Constitution Principle III and Spec 003
**Reference**: Constitution Test-First Development, Spec 003

### 7.2 Performance Testing - 🔴 Not Started

**Current State**: No performance testing infrastructure.

**Missing**:

- [ ] Load testing setup (k6, Artillery, or similar)
- [ ] Performance benchmarks
- [ ] Performance regression detection
- [ ] Stress testing
- [ ] API endpoint performance tests
- [ ] Database query performance tests

**Priority**: Medium
**Impact**: Ensures performance standards are maintained under load
**Reference**: Spec 003, Constitution Principle VII

---

## 8. Multi-Language & Localization

### 8.1 Location-Based Detection - 🟡 Partial

**Current State**: Browser language detection exists, but no IP-based location detection for currency.

**Missing**:

- [ ] IP geolocation service integration
- [ ] Location-based currency detection (USD for US, EUR for Europe, ILS for Israel)
- [ ] Location-based content personalization
- [ ] Fallback when geolocation unavailable

**Priority**: Medium
**Impact**: Improves user experience by defaulting to local currency
**Reference**: Spec 001 FR-012

### 8.2 Translation Management - 🟡 Partial

**Current State**: Strapi i18n plugin provides multi-language content management. No batch workflows.

**Missing**:

- [ ] Batch translation workflow (mark multiple items for translation)
- [ ] Translation progress tracking dashboard
- [ ] Translation quality checks
- [ ] Machine translation integration (optional, Google Translate API)
- [ ] Translation memory
- [ ] Glossary management
- [ ] Translator role/permissions

**Priority**: Low-Medium
**Impact**: Improves editorial workflow efficiency
**Reference**: Spec 001 FR-025

---

## 9. Content Management & Editorial

### 9.1 Content Relationships - 🟡 Partial

**Current State**: Basic relations exist (product to currency), but many planned relations are missing.

**Missing**:

- [ ] Product to Category relation (many-to-many)
- [ ] Product to Review relation (one-to-many)
- [ ] Product to Bundle relation (many-to-many)
- [ ] Article to Category/Tag relation (many-to-many)
- [ ] Article to Author relation (many-to-one)
- [ ] Brand content type with relation to Products

**Priority**: High
**Impact**: Essential for content organization and navigation
**Reference**: Spec 001 FR-026

### 9.2 Media Management - 🟡 Partial

**Current State**: Strapi has basic media library, but optimization and organization features missing.

**Missing**:

- [ ] Image upload optimization (automatic WebP conversion)
- [ ] Image resizing on upload
- [ ] Alt text enforcement
- [ ] Media folders/organization
- [ ] Media tagging
- [ ] Media search
- [ ] Unused media detection
- [ ] Media CDN integration

**Priority**: Medium
**Impact**: Improves editorial workflow and site performance
**Reference**: Constitution Principle VII

---

## 10. API & Integration

### 10.1 API Documentation - 🟡 Partial

**Current State**: OpenAPI spec exists, Swagger UI available. Documentation could be more comprehensive.

**Missing**:

- [ ] API usage examples in documentation
- [ ] API rate limiting documentation
- [ ] API authentication documentation (if/when auth added)
- [ ] API changelog
- [ ] API client libraries (JavaScript, Python)
- [ ] Postman collection

**Priority**: Low-Medium
**Impact**: Improves developer experience for API consumers
**Reference**: Constitution API-First Design

### 10.2 Webhook System - 🔴 Not Started

**Current State**: No webhook system for external integrations.

**Missing**:

- [ ] Webhook content type (URL, events, secret, active/inactive)
- [ ] Webhook event triggers (content created, updated, deleted)
- [ ] Webhook delivery system (retry logic, failure handling)
- [ ] Webhook signature verification
- [ ] Webhook logs/history
- [ ] Webhook management UI

**Priority**: Low (Future Enhancement)
**Impact**: Enables external integrations and automations
**Reference**: PRD Section 5 (API-first Architecture)

### 10.3 Third-Party Integrations - 🔴 Not Started

**Current State**: No third-party service integrations beyond basic infrastructure.

**Missing**:

- [ ] Email service provider (Mailchimp, SendGrid, etc.)
- [ ] Payment processor (Stripe, PayPal - if direct sales added)
- [ ] Affiliate network APIs (Amazon Associates, ShareASale, etc.)
- [ ] Social media sharing APIs
- [ ] SEO plugin integrations (limited in headless context)
- [ ] Customer support chat widget
- [ ] Marketing automation platforms

**Priority**: Low-Medium
**Impact**: Depends on specific business requirements
**Reference**: PRD Section 5

---

## 11. Security & Compliance

### 11.1 GDPR Compliance - 🟡 Partial

**Current State**: Privacy policy page exists, basic structure in place.

**Missing**:

- [ ] Cookie consent banner
- [ ] Cookie policy page
- [ ] Data processing agreement
- [ ] User data export functionality
- [ ] User data deletion functionality (right to be forgotten)
- [ ] Privacy-focused analytics configuration
- [ ] Third-party cookie audit
- [ ] Consent management for analytics/marketing tools

**Priority**: High
**Impact**: Legal requirement for EU visitors
**Reference**: Constitution Security & Compliance, PRD

### 11.2 Accessibility (WCAG 2.1 AA) - 🟡 Partial

**Current State**: Some ARIA labels exist, but comprehensive accessibility audit needed.

**Missing**:

- [ ] Full WCAG 2.1 AA compliance audit
- [ ] Keyboard navigation testing and fixes
- [ ] Screen reader testing and optimization
- [ ] Color contrast verification
- [ ] Focus indicators on all interactive elements
- [ ] Skip navigation links
- [ ] Accessible form validation
- [ ] Accessible error messages
- [ ] Alt text enforcement in CMS
- [ ] Automated accessibility testing in CI/CD

**Priority**: High
**Impact**: Required per Constitution and legal requirements
**Reference**: Constitution Principle VII (FR-038), Spec 001 FR-036 to FR-038

---

## 12. Infrastructure & DevOps

### 12.1 Deployment Pipeline - 🟡 Partial

**Current State**: Docker setup exists, GitHub Actions CI exists. Deployment automation unclear.

**Missing**:

- [ ] Automated deployment to staging environment
- [ ] Automated deployment to production environment
- [ ] Deployment rollback mechanism
- [ ] Blue-green or canary deployments
- [ ] Infrastructure as Code (Terraform, Pulumi, etc.)
- [ ] Environment-specific configuration management
- [ ] Database migration automation in deployment

**Priority**: Medium
**Impact**: Required for reliable deployments
**Reference**: Constitution Development Workflow

### 12.2 Monitoring & Observability - 🔴 Not Started

**Current State**: No application monitoring or logging infrastructure.

**Missing**:

- [ ] Application performance monitoring (APM) - New Relic, Datadog, etc.
- [ ] Error tracking (Sentry, Rollbar, etc.)
- [ ] Log aggregation (Datadog, Papertrail, CloudWatch, etc.)
- [ ] Uptime monitoring
- [ ] Database performance monitoring
- [ ] Redis monitoring
- [ ] Alert system (PagerDuty, OpsGenie, etc.)
- [ ] Status page

**Priority**: Medium-High
**Impact**: Critical for production reliability
**Reference**: Best practices for production applications

### 12.3 Backup & Disaster Recovery - 🔴 Not Started

**Current State**: No backup or disaster recovery plan documented.

**Missing**:

- [ ] Automated database backups
- [ ] Media/upload backups
- [ ] Backup retention policy
- [ ] Backup verification/testing
- [ ] Disaster recovery plan documentation
- [ ] Disaster recovery testing
- [ ] Point-in-time recovery capability

**Priority**: High
**Impact**: Critical for business continuity
**Reference**: Best practices for production applications

---

## Priority Summary

### Critical (Must Have for Production)

1. Reviews & Ratings System
2. Category System & Category Pages
3. Product Search Functionality
4. Smart Filters
5. Currency Conversion (actual conversion, not just display)
6. Schema Markup Enhancement (reviews, product details)
7. Test Coverage Increase (Frontend to 80%, CMS implementation)
8. Google Analytics Integration
9. GDPR Compliance Features
10. Accessibility WCAG 2.1 AA Compliance
11. Automatic 301/410 Redirects
12. Image Optimization (WebP, lazy loading)

### High Priority (Should Have Soon)

1. Blog/Content Pages System
2. Breadcrumb Navigation
3. Affiliate Link Tracking & Management
4. Product Content Enhancement (images, certifications, materials, brand)
5. Performance Monitoring
6. Monitoring & Observability
7. Backup & Disaster Recovery

### Medium Priority (Nice to Have)

1. Bundle/Kit Recommendations
2. Email Newsletter/Subscribe
3. Translation Management Workflows
4. Location-Based Detection
5. API Documentation Enhancement
6. Media Management Features
7. Deployment Pipeline Automation

### Low Priority (Future Enhancements)

1. Personalization Engine
2. User Authentication & Login
3. Webhook System
4. Third-Party Integrations (beyond essential ones)
5. Performance Testing Infrastructure

---

## Version History

| Version | Date       | Changes                                                  |
|---------|------------|----------------------------------------------------------|
| 1.0.0   | 2025-11-07 | Initial roadmap created from comprehensive code analysis |

---

## Contributing

This roadmap is a living document. As features are implemented or priorities change, this document should be updated to
reflect the current state and future direction of the Affilibuster platform.

To update this roadmap:

1. Review the current status of features by examining actual code implementation
2. Update status indicators (🔴/🟡/🟢)
3. Add new features as requirements are identified
4. Reprioritize based on business needs
5. Update version history

---

**Note**: This roadmap is based on actual code analysis conducted on 2025-11-07, comparing implementation against
documented requirements. Task completion status in spec files was **not** relied upon - only actual source code
implementation was considered.
