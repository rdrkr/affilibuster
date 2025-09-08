<!--
Sync Impact Report
==================
Version Change: Template → 1.0.0
Modified Principles: N/A (initial constitution creation)
Added Sections: All core principles (I-VII), Technical Standards, Development Workflow, Governance
Removed Sections: N/A
Templates Status:
  ✅ plan-template.md - Updated Constitution Check section with concrete checklist items for all 7 principles
  ✅ spec-template.md - No updates required (tech-agnostic by design)
  ✅ tasks-template.md - Already follows TDD principle
  ✅ agent-file-template.md - No updates required
Follow-up TODOs: None
-->

# Affilibuster Constitution

## Core Principles

### I. Clean Architecture
**MUST** follow Clean Architecture patterns for all implementations:
- Core business logic isolated from framework dependencies
- Dependency inversion: outer layers depend on inner layers, never reversed
- Clear separation of concerns: entities, use cases, interface adapters, frameworks
- No database, UI, or external service dependencies in business logic

**Rationale**: Ensures long-term maintainability, testability, and the ability to swap frameworks or data sources without rewriting business logic. Critical for reusability across multiple affiliate sites.

### II. SOLID Principles (NON-NEGOTIABLE)
**MUST** adhere to SOLID principles in all code:
- **S**ingle Responsibility: Each module/class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable for base types
- **I**nterface Segregation: Many specific interfaces over one general interface
- **D**ependency Inversion: Depend on abstractions, not concretions

**Rationale**: These principles are foundational to the project's technical requirements. They ensure code quality, maintainability, and enable the generic, modular implementation required for multi-site reusability.

### III. Test-First Development (NON-NEGOTIABLE)
**MUST** follow strict TDD workflow:
- Write tests BEFORE implementation
- Tests MUST fail initially (red phase)
- Implement minimum code to pass tests (green phase)
- Refactor while keeping tests green
- User approval required before implementation begins

**Rationale**: TDD ensures requirements are clear, code is testable by design, and regressions are caught immediately. Essential for maintaining quality across reusable components.

### IV. Modular & Reusable Architecture
**MUST** build components for reusability across multiple affiliate sites:
- Generic, configurable components over site-specific implementations
- Clear configuration boundaries (site-specific data vs. shared logic)
- Shared component library for common functionality (product display, affiliate links, reviews)
- Theme and content separation from core functionality

**Rationale**: The project explicitly requires building a foundation for multiple affiliate sites. Every component must be designed with reusability in mind.

### V. Integration Testing Priority
**MUST** provide integration tests for:
- New module or service contracts
- Changes to existing contracts or APIs
- Inter-service or inter-module communication
- Shared data schemas and models
- Critical user flows (product display, affiliate link tracking, search, filtering)

**Rationale**: Integration tests validate that modular components work together correctly, especially critical when building reusable components that will be composed differently across sites.

### VI. API-First Design
**MUST** design all functionality with API-first approach:
- Clear contract definitions before implementation
- RESTful or GraphQL APIs for all data operations
- API versioning from the start
- Comprehensive API documentation
- Support for headless CMS integration

**Rationale**: Supports the project's scaling goals (API-first architecture, headless CMS option) and enables frontend flexibility across different affiliate sites.

### VII. Performance & SEO Standards
**MUST** meet performance and SEO requirements:
- Page load time <3s on 3G connections
- Lighthouse performance score >90
- Schema markup for products and reviews
- hreflang tags for multi-language support (English, Italian, Hebrew)
- Image optimization (lazy loading, eager loading, WebP format, responsive images, alt tags)
- Proper caching strategy
- Ability to integrate seamlessly with yoast or RankMath SEO plugins
- Ability to handle 301s and 410s for the end-user
- Critical CSS inlined to optimize loading times
- Breadcrumb settings at page level for better navigation and SEO
- Prefer static HTML generation where feasible
- Do not use infinite scroll for product listings; use pagination or accordions instead
- Define human-readable customizable, SEO-friendly URLs including slugs

**Rationale**: SEO and performance are critical success factors for affiliate sites. These are non-negotiable requirements for organic traffic generation.

## Technical Standards

### Technology Stack
**MUST** use modern, popular technologies with strong ecosystem support:
- Latest stable versions of chosen languages and frameworks
- Statically typed languages preferred (TypeScript, Kotlin, Python with type hints)
- Frameworks that support Clean Architecture (e.g., NestJS, Kotlin Multiplatform, Django, Flask)
- Well-maintained dependencies with active communities
- Prefer established patterns over bleeding-edge experimental approaches
- Document technology choices in research.md with rationale

### Multi-Language Support
**MUST** support internationalization from the start:
- Content available in English, Italian, and Hebrew
- RTL layout support for Hebrew
- Localized URLs and SEO metadata
- Locale-specific number, date, and currency formatting

### Security & Compliance
**MUST** implement security and legal compliance:
- Secure affiliate link generation and tracking
- Privacy policy and affiliate disclosure pages
- GDPR-compliant data handling
- Secure credential management (no secrets in code)
- Input validation and sanitization

## Development Workflow

### Planning & Design
**MUST** follow the spec → plan → tasks workflow:
1. Feature spec defines **what** and **why** (user value)
2. Implementation plan defines **how** (technical design)
3. Tasks define **step-by-step** execution
4. Constitution checks at each gate

### Documentation Requirements
**MUST** maintain documentation for:
- API contracts (OpenAPI/GraphQL schemas)
- Data models and entity relationships
- Component usage and configuration
- Quickstart guides for common scenarios
- In-code documentation (JSDoc, Python docstrings, etc.) 
with full coverage of types, functions, parameters, returns, throws, etc.

### Code Review Gates
All changes **MUST** pass:
- Constitution compliance verification
- SOLID principles adherence check
- Test coverage validation (minimum 80%)
- Performance impact assessment
- Security review for user-facing features

## Governance

### Amendment Process
Constitution amendments require:
1. Written proposal documenting the change and rationale
2. Impact analysis on existing code and templates
3. Migration plan for existing features if needed
4. Version bump following semantic versioning

### Versioning Policy
- **MAJOR**: Principle removal or incompatible governance changes
- **MINOR**: New principle addition or expanded guidance
- **PATCH**: Clarifications, typo fixes, non-semantic refinements

### Compliance Reviews
- Every pull request **MUST** reference constitutional compliance
- Quarterly architecture reviews for continued alignment
- Complexity additions **MUST** be justified in writing
- Violations documented in plan.md Complexity Tracking section

### Constitutional Authority
This constitution supersedes all other development practices and guidelines. When conflicts arise, constitution principles take precedence. Exceptions require explicit documentation and approval.

**Version**: 1.0.0 | **Ratified**: 2025-10-04 | **Last Amended**: 2025-10-04
