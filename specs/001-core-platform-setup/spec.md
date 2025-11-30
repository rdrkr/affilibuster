# Feature Specification: Core Platform Setup & Multi-Language Infrastructure

**Feature Branch**: `001-core-platform-setup`
**Created**: 2025-10-04
**Status**: ✅ Complete (184/184 tasks)
**Last Updated**: 2025-11-21
**Input**: User description: "Core Platform Setup & Multi-Language Infrastructure"

## Implementation Status

**Progress**: 100% complete (184 of 184 tasks completed)

**All Tasks Complete** - Core platform setup is fully implemented.

**Completed Highlights**:

- ✅ Multi-language infrastructure (English, Italian, Hebrew with RTL)
- ✅ Currency selection and conversion system
- ✅ SEO hreflang tags and sitemaps
- ✅ Frontend architecture (Next.js 16 with App Router)
- ✅ Backend architecture (FastAPI with clean architecture)
- ✅ CMS integration (Strapi 5.28+)
- ✅ i18n with next-intl
- ✅ 100% test coverage (backend and frontend)
- ✅ Performance optimization (Lighthouse >90)
- ✅ URL redirect handling (301/410) in frontend middleware (T145)

## Execution Flow (main)

```
1. Parse user description from Input
   → ✅ Feature description provided
2. Extract key concepts from description
   → ✅ Identified: platform foundation, multi-language support, content delivery
3. For each unclear aspect:
   → No ambiguities - all clarifications received
4. Fill User Scenarios & Testing section
   → ✅ User flows defined
5. Generate Functional Requirements
   → ✅ All requirements testable
6. Identify Key Entities (if data involved)
   → ✅ Entities identified
7. Run Review Checklist
   → ✅ No implementation details in spec
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a visitor to the eco-friendly affiliate website, I want to access content in my preferred language (English, Italian, or Hebrew) with proper formatting and cultural conventions, so that I can comfortably browse products and make informed purchasing decisions regardless of my location or language preference.

### Acceptance Scenarios

1. **Given** a visitor accesses the website for the first time at the root domain (e.g. thegreenbrother.com), **When** the system detects their browser language or location preference differs from English, **Then** a prompt appears asking if they want to switch to their preferred language version (e.g. thegreenbrother.com/it or e.g. thegreenbrother.com/he)

2. **Given** a visitor is viewing the English version (e.g. thegreenbrother.com), **When** they select Italian from the language switcher, **Then** they navigate via internal link to the Italian version (e.g. thegreenbrother.com/it) and they can see the content of that page

3. **Given** a Hebrew-speaking visitor accesses the Hebrew version (e.g. thegreenbrother.com/he), **When** any page loads, **Then** the layout displays in right-to-left (RTL) orientation with properly mirrored UI elements and Hebrew text, while the URL structure is in english/he/slug (customizable by te admin)

4. **Given** a visitor browses product pages in any language version, **When** they view prices and dates, **Then** numbers and dates are formatted according to the locale conventions, and the visitor can change the currency display from a currency selector to view prices in their preferred currency

5. **Given** a content editor creates a product description, **When** they publish it with translations in all three languages, **Then** visitors see the product in their preferred language, or English as fallback if their language version is unavailable

6. **Given** a search engine crawler accesses the website, **When** it reads the page metadata, **Then** proper hreflang tags indicate available language versions for SEO indexing. It is possible that a page will not be produced in one or more of the languges. In that case, the hreflang tag for that language will be omitted.

7. **Given** an editor manages content in the CMS, **When** they add a new product or article, **Then** they can input content for each supported language without technical knowledge

### Edge Cases

- **What happens when a page translation is incomplete?** The system falls back to English (primary language) for missing content while keeping the UI in the user's selected language version
- **What happens when a user's browser language is not supported (e.g., Spanish)?** No prompt appears; the system serves the language version of the URL the user lands on
- **What happens if a user dismisses the language switch prompt?** The system remembers their preference and doesn't prompt again for that session, serving the current language version
- **What happens when a user manually types a URL from a different language version?** The system serves the requested language version without prompting, as the explicit URL indicates intent
- **How does the system handle mixed-direction content?** When displaying user-generated content that mixes RTL and LTR text, proper Unicode bidirectional algorithm support ensures correct rendering
- **What happens when a user switches currency on a non-default language site?** The currency preference is maintained across language switches and stored for future visits
- **How are deep links handled across language versions?** When a user accesses e.g. thegreenbrother.com/it/products/eco-bottle, the equivalent English page is e.g. thegreenbrother.com/products/eco-bottle, with proper hreflang linking between them. The different urls are not generated/published automatically and the admin can modify the slug for each page as well as the hreflang links.
- **What happens when accessing a language-specific URL that doesn't exist?** The system sends the user to the homepage of the appropriate language version

## Requirements _(mandatory)_

### Functional Requirements

#### Multi-Language Support

- **FR-001**: System MUST support content delivery in three languages: English (primary at e.g. thegreenbrother.com), Italian (at e.g. thegreenbrother.com/it), and Hebrew (at e.g. thegreenbrother.com/he)
- **FR-002**: System MUST detect user's browser language or location preference when they access the root domain (e.g. thegreenbrother.com)
- **FR-003**: System MUST display a non-intrusive prompt asking if the user wants to switch to their detected language version when it differs from English, in case the user lands on a page whose language is different than the detected language. The prompt should be triggered only upon user interaction with the page (e.g., scroll, mouse movement, click) and only once per session.
- **FR-004**: Users MUST be able to manually switch between language versions via a language selector visible on all pages, which redirects to the appropriate language URL path
- **FR-005**: System MUST remember prompt dismissal preference for the current session and not re-prompt the user
- **FR-006**: System MUST maintain language preference by serving the appropriate URL path (e.g. thegreenbrother.com, e.g. thegreenbrother.com/it, or e.g. thegreenbrother.com/he)
- **FR-007**: System MUST display Hebrew content in right-to-left (RTL) layout with properly mirrored UI components
- **FR-008**: System MUST fall back to English content when content in the selected language is unavailable while maintaining the UI in the selected language version

#### Localization & Formatting

- **FR-009**: System MUST format dates according to the selected language's locale conventions (DD/MM/YYYY for Italian/Hebrew, MM/DD/YYYY for English)
- **FR-010**: System MUST format numbers with appropriate thousands separators and decimal points per locale
- **FR-011**: System MUST provide a currency selector allowing users to choose their preferred currency for price display
- **FR-012**: System MUST display default currency based on the detected location (USD for United States, EUR for Italy/Europe, ILS for Israel) until user selects a different currency
- **FR-013**: System MUST persist user's currency selection across sessions and language switches
- **FR-014**: System MUST format currency values with proper symbols, decimal places, and positioning according to the selected currency's conventions
- **FR-015**: System MUST handle timezone display appropriately for international audiences

#### SEO & Discoverability

- **FR-016**: System MUST generate hreflang meta tags for all pages indicating available language versions (x-default for e.g. thegreenbrother.com, it for e.g. thegreenbrother.com/it, he for e.g. thegreenbrother.com/he)
- **FR-017**: System MUST create SEO-friendly, human-readable URLs with language path prefixes: root domain for English (e.g. thegreenbrother.com/products/), /it/ for Italian (e.g. thegreenbrother.com/it/prodotti/), /he/ for Hebrew (e.g. thegreenbrother.com/he/products/). The URLs slugs are always customizable by the admin
- **FR-018**: System MUST allow customization of URL slugs per language for optimal SEO. In case a slug gets changed, the system MUST automatically create 301 redirects from the old URL to the new one at the time of slug update. If a page/language version is removed, the system MUST automatically create a 410 status code response for that URL at the time of deletion.
- **FR-019**: System MUST maintain equivalent page mapping across language versions for proper canonical and alternate URL references
- **FR-020**: System MUST generate language-specific sitemaps for search engine crawlers (sitemap.xml, sitemap-it.xml, sitemap-il.xml)
- **FR-021**: System MUST include language-specific schema markup for rich snippets in the appropriate language

#### Content Management

- **FR-022**: Content editors MUST be able to create and manage content in all three languages through a single interface
- **FR-023**: System MUST clearly indicate which language versions of content exist and which are missing
- **FR-024**: System MUST allow partial translations at both page level (some pages in all languages, others English-only) and field level (within a single page, some fields translated while others fall back to English)
- **FR-025**: System MUST support batch content translation workflows for editors
- **FR-026**: System MUST preserve content relationships (e.g., product-to-category) across language versions and their respective URL structures

#### Platform Foundation

- **FR-027**: System MUST deliver pages with Largest Contentful Paint (LCP) under 2.5 seconds and total page load (window.onload) under 3 seconds on 3G connections across all language versions
- **FR-028**: System MUST achieve Lighthouse performance score above 90 for all language versions
- **FR-029**: System MUST support static HTML generation where feasible for optimal performance
- **FR-030**: System MUST implement proper caching strategies that respect language-specific content and URL paths
- **FR-031**: System MUST inline critical CSS to optimize initial page load for all languages

#### API & Integration

- **FR-032**: System MUST expose a REST API that accepts language parameters for all content requests
- **FR-033**: System MUST provide API versioning from the start to support future changes
- **FR-034**: System MUST return appropriate HTTP headers for language content negotiation and currency preferences
- **FR-035**: System MUST support CORS for potential future frontend deployments on different domains

#### Accessibility & Standards

- **FR-036**: System MUST include proper lang attributes on HTML elements for each language version
- **FR-037**: System MUST support screen readers in all three languages
- **FR-038**: System MUST meet WCAG 2.1 AA accessibility standards across all language versions

### Key Entities

- **Language**: Represents a supported language with code (en, it, he), display name, direction (LTR/RTL), URL path prefix (root for English, /it/ for Italian, /he/ for Hebrew), default currency, and locale formatting rules
- **TranslatableContent**: Abstract representation of content that can exist in multiple language versions, including status tracking for each translation and equivalent page mappings across language paths
- **Locale**: Cultural and regional settings including date formats, number formats, default currency per language, and timezone preferences
- **Currency**: Represents a currency option with code (USD, EUR, ILS, etc.), symbol, display format, and decimal precision
- **ContentVersion**: Specific versions of content tied to a language, including SEO metadata (title, description, keywords, custom URL slug) and the corresponding URL path. All customizable by the admin and independent one from another (while linked via hreflang)
- **URLRoute**: SEO-friendly URL structure with language-specific path prefixes (e.g. thegreenbrother.com/_, e.g. thegreenbrother.com/it/_, e.g. thegreenbrother.com/he/\*), custom slugs per language, redirects (301/410), and canonical/alternate URL references for hreflang
- **UserPreferences**: Stores user choices including dismissed language prompts, selected currency, and session data for personalization

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
