# Implementation Plan: User Authentication & Login

**Branch**: `004-user-authentication` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-user-authentication/spec.md`

## Summary

Implement a comprehensive user authentication system supporting email/password registration, login/logout, password reset, email verification, profile management, social login (Google/Facebook), wish lists, and optional 2FA. The system will integrate with the existing user_preferences infrastructure to provide persistent, cross-device user experiences while following Clean Architecture principles and API-first design.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.7+ (frontend)
**Primary Dependencies**:

- Backend: FastAPI 0.120+, SQLAlchemy 2.0+, passlib (bcrypt), python-jose (JWT), python-multipart, authlib (OAuth 2.0 with PKCE)
- Frontend: Next.js 16, React 19, custom auth hooks with PKCE support
**Storage**: PostgreSQL 15+ (user accounts, sessions, tokens)
**Testing**: pytest with asyncio (backend), Jest + React Testing Library (frontend), Playwright (E2E)
**Target Platform**: Web application (Linux server, browser clients)
**Project Type**: Web (backend + frontend)
**Performance Goals**:
- Login latency <500ms p95
- Token validation <50ms p95
- Support 100+ concurrent auth requests/second
**Constraints**:
- Must use secure HTTP-only cookies for session management
- Must hash passwords with bcrypt (cost 12)
- Must implement rate limiting (5 login attempts per 15 minutes)
- Must maintain 100% backend test coverage
**Scale/Scope**:
- Expected: 10,000+ registered users at launch
- 8 new database tables
- 15+ new backend API endpoints
- 5+ frontend components and hooks
- Complete OAuth integration for 2 providers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Clean Architecture

- **Compliance**: Domain layer (User, UserSession entities, AuthRepository interfaces, authentication use cases) will be independent of frameworks
- **Verification**: Use cases will not import FastAPI, SQLAlchemy, or external services directly
- **Status**: PASS - Plan adheres to Clean Architecture with clear layer separation

### ✅ II. SOLID Principles

- **S (Single Responsibility)**: Each use case handles one auth operation (RegisterUser, LoginUser, ResetPassword, etc.)
- **O (Open/Closed)**: AuthRepository interface allows swapping implementations; OAuth provider strategy pattern
- **L (Liskov Substitution)**: All repository implementations are substitutable
- **I (Interface Segregation)**: Separate interfaces for UserRepository, SessionRepository, TokenRepository
- **D (Dependency Inversion)**: Use cases depend on repository interfaces, not concrete implementations
- **Status**: PASS - Design follows all SOLID principles

### ✅ III. Strongly Typed

- **Backend**: Use Pydantic models for request/response schemas, SQLAlchemy models for DB entities
- **Frontend**: Generate TypeScript types from OpenAPI spec for API contracts
- **Type Safety**: All functions and methods will have explicit type annotations
- **Status**: PASS - Strong typing enforced throughout backend and frontend

### ✅ IV. Test-First Development (TDD)

- **Approach**: Write tests for each use case BEFORE implementation
- **Process**: Red (failing test) → Green (minimal implementation) → Refactor
- **Coverage Target**: 100% backend, 15% minimum frontend
- **User Approval**: This plan requires approval before implementation begins
- **Status**: PASS - TDD workflow will be followed strictly

### ✅ V. Modular & Reusable Architecture

- **Design**: Generic authentication module usable across multiple affiliate sites
- **Configuration**: Site-specific settings (OAuth keys, email templates) in config files
- **Reusability**: Authentication can be extracted as a standalone module
- **Status**: PASS - Authentication system is generic and configurable

### ✅ VI. Integration Testing Priority

- **Coverage**: Integration tests for all API endpoints, authentication flows, OAuth flows
- **Critical Flows**: Registration → verification → login → profile update → logout
- **Inter-module**: Test integration between auth system and existing user_preferences
- **Status**: PASS - Comprehensive integration tests planned

### ✅ VII. API-First Design

- **Approach**: OpenAPI spec will be written first, implementation follows spec
- **Contract**: All endpoints defined in `contracts/template.openapi.yaml`
- **Security Schemes**: OAuth 2.0 with PKCE flow configured in OpenAPI spec (authorizationCode with PKCE)
- **Versioning**: API version v1 for all auth endpoints
- **Documentation**: Complete API docs with examples
- **Status**: PASS - API-first approach will be followed with OAuth 2.0 PKCE security

### ✅ VIII. Performance & SEO Standards

- **Performance**: Token validation <50ms, login <500ms, no blocking operations
- **Caching**: Redis for session token validation caching
- **SEO**: No direct SEO impact, but enables user-generated content (reviews) which benefits SEO
- **Status**: PASS - Performance targets defined and achievable

## Project Structure

### Documentation (this feature)

```
specs/004-user-authentication/
├── plan.md              # This file
├── spec.md              # Feature specification (created)
├── research.md          # Technical research on auth libraries and patterns
├── data-model.md        # Database schema and entity relationship diagram
├── quickstart.md        # Developer guide for authentication system
├── contracts/           # API request/response examples
│   ├── register.json
│   ├── login.json
│   ├── password-reset.json
│   └── oauth-flow.md
└── tasks.md             # Step-by-step implementation tasks
```

### Source Code (repository root)

```
backend/
├── src/affilibuster_backend/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.py                    # User entity (NEW)
│   │   │   ├── user_session.py            # Session entity (NEW)
│   │   │   ├── password_reset_token.py    # Reset token entity (NEW)
│   │   │   ├── email_verification_token.py # Verification token (NEW)
│   │   │   ├── oauth_connection.py        # OAuth link entity (NEW)
│   │   │   ├── wish_list_item.py          # Wish list entity (NEW)
│   │   │   ├── two_factor_auth.py         # 2FA entity (NEW)
│   │   │   └── audit_log.py               # Audit log entity (NEW)
│   │   ├── repositories/
│   │   │   ├── user_repository.py         # User repo interface (NEW)
│   │   │   ├── session_repository.py      # Session repo interface (NEW)
│   │   │   ├── token_repository.py        # Token repo interface (NEW)
│   │   │   ├── oauth_repository.py        # OAuth repo interface (NEW)
│   │   │   ├── wish_list_repository.py    # Wish list repo interface (NEW)
│   │   │   └── audit_log_repository.py    # Audit repo interface (NEW)
│   │   └── use_cases/
│   │       ├── auth/
│   │       │   ├── register_user_use_case.py           # (NEW)
│   │       │   ├── login_user_use_case.py              # (NEW)
│   │       │   ├── logout_user_use_case.py             # (NEW)
│   │       │   ├── verify_email_use_case.py            # (NEW)
│   │       │   ├── request_password_reset_use_case.py  # (NEW)
│   │       │   ├── reset_password_use_case.py          # (NEW)
│   │       │   ├── change_password_use_case.py         # (NEW)
│   │       │   ├── refresh_session_use_case.py         # (NEW)
│   │       │   └── revoke_all_sessions_use_case.py     # (NEW)
│   │       ├── profile/
│   │       │   ├── get_user_profile_use_case.py        # (NEW)
│   │       │   ├── update_profile_use_case.py          # (NEW)
│   │       │   ├── change_email_use_case.py            # (NEW)
│   │       │   └── delete_account_use_case.py          # (NEW)
│   │       ├── oauth/
│   │       │   ├── google_oauth_use_case.py            # (NEW)
│   │       │   ├── facebook_oauth_use_case.py          # (NEW)
│   │       │   ├── link_oauth_provider_use_case.py     # (NEW)
│   │       │   └── unlink_oauth_provider_use_case.py   # (NEW)
│   │       ├── wish_list/
│   │       │   ├── add_to_wish_list_use_case.py        # (NEW)
│   │       │   ├── remove_from_wish_list_use_case.py   # (NEW)
│   │       │   └── get_wish_list_use_case.py           # (NEW)
│   │       └── two_factor/
│   │           ├── enable_2fa_use_case.py              # (NEW)
│   │           ├── verify_2fa_use_case.py              # (NEW)
│   │           └── disable_2fa_use_case.py             # (NEW)
│   ├── infrastructure/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py                  # Auth endpoints (NEW)
│   │   │   │   ├── profile.py               # Profile endpoints (NEW)
│   │   │   │   ├── oauth.py                 # OAuth endpoints (NEW)
│   │   │   │   └── wish_list.py             # Wish list endpoints (NEW)
│   │   │   ├── middleware/
│   │   │   │   ├── auth_middleware.py       # JWT validation (NEW)
│   │   │   │   └── rate_limiter.py          # Rate limiting (NEW)
│   │   │   └── dependencies/
│   │   │       └── auth_dependencies.py     # Get current user (NEW)
│   │   ├── database/
│   │   │   ├── models/
│   │   │   │   ├── user.py                  # User SQLAlchemy model (NEW)
│   │   │   │   ├── user_session.py          # Session model (NEW)
│   │   │   │   ├── password_reset_token.py  # Reset token model (NEW)
│   │   │   │   ├── email_verification_token.py # Verification model (NEW)
│   │   │   │   ├── oauth_connection.py      # OAuth model (NEW)
│   │   │   │   ├── wish_list_item.py        # Wish list model (NEW)
│   │   │   │   ├── two_factor_auth.py       # 2FA model (NEW)
│   │   │   │   └── audit_log.py             # Audit model (NEW)
│   │   │   └── repositories/
│   │   │       ├── user_repository_impl.py  # User repo implementation (NEW)
│   │   │       ├── session_repository_impl.py # Session repo implementation (NEW)
│   │   │       ├── token_repository_impl.py # Token repo implementation (NEW)
│   │   │       ├── oauth_repository_impl.py # OAuth repo implementation (NEW)
│   │   │       └── wish_list_repository_impl.py # Wish list repo impl (NEW)
│   │   ├── security/
│   │   │   ├── password_hasher.py           # Password hashing (NEW)
│   │   │   ├── token_generator.py           # JWT/token generation (NEW)
│   │   │   ├── oauth_client.py              # OAuth client wrapper (NEW)
│   │   │   └── totp_handler.py              # 2FA TOTP handler (NEW)
│   │   ├── email/
│   │   │   ├── email_service.py             # Email sending interface (NEW)
│   │   │   ├── smtp_email_service.py        # SMTP implementation (NEW)
│   │   │   └── templates/
│   │   │       ├── verification_email.html  # (NEW)
│   │   │       ├── password_reset_email.html # (NEW)
│   │   │       └── password_changed_email.html # (NEW)
│   │   └── dependencies.py                  # Updated with auth dependencies
│   └── config/
│       └── settings.py                      # Updated with auth settings
└── tests/
    ├── unit/
    │   ├── domain/
    │   │   ├── entities/
    │   │   │   ├── test_user.py             # (NEW)
    │   │   │   ├── test_user_session.py     # (NEW)
    │   │   │   └── ... (all entity tests)
    │   │   └── use_cases/
    │   │       ├── auth/
    │   │       │   ├── test_register_user.py # (NEW)
    │   │       │   ├── test_login_user.py   # (NEW)
    │   │       │   └── ... (all use case tests)
    │   │       └── ...
    │   └── infrastructure/
    │       ├── security/
    │       │   ├── test_password_hasher.py  # (NEW)
    │       │   └── test_token_generator.py  # (NEW)
    │       └── ...
    └── integration/
        ├── api/
        │   ├── test_auth_endpoints.py       # (NEW)
        │   ├── test_profile_endpoints.py    # (NEW)
        │   ├── test_oauth_endpoints.py      # (NEW)
        │   └── test_wish_list_endpoints.py  # (NEW)
        └── flows/
            ├── test_registration_flow.py    # (NEW)
            ├── test_login_flow.py           # (NEW)
            ├── test_password_reset_flow.py  # (NEW)
            └── test_oauth_flow.py           # (NEW)

frontend/
├── src/
│   ├── app/[lang]/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx                 # Login page (NEW)
│   │   │   ├── register/
│   │   │   │   └── page.tsx                 # Registration page (NEW)
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx                 # Email verification (NEW)
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx                 # Forgot password (NEW)
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx                 # Reset password (NEW)
│   │   │   └── oauth-callback/
│   │   │       └── page.tsx                 # OAuth callback (NEW)
│   │   ├── profile/
│   │   │   ├── page.tsx                     # Profile page (NEW)
│   │   │   ├── settings/
│   │   │   │   └── page.tsx                 # Settings page (NEW)
│   │   │   └── wish-list/
│   │   │       └── page.tsx                 # Wish list page (NEW)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx                # (NEW)
│   │   │   ├── RegisterForm.tsx             # (NEW)
│   │   │   ├── ForgotPasswordForm.tsx       # (NEW)
│   │   │   ├── ResetPasswordForm.tsx        # (NEW)
│   │   │   ├── SocialLoginButtons.tsx       # (NEW)
│   │   │   └── ProtectedRoute.tsx           # (NEW)
│   │   ├── profile/
│   │   │   ├── ProfileInfo.tsx              # (NEW)
│   │   │   ├── EditProfile.tsx              # (NEW)
│   │   │   ├── ChangePasswordForm.tsx       # (NEW)
│   │   │   └── TwoFactorSetup.tsx           # (NEW)
│   │   ├── wish-list/
│   │   │   ├── WishListButton.tsx           # (NEW)
│   │   │   └── WishListGrid.tsx             # (NEW)
│   │   └── Header.tsx                       # Updated with auth UI
│   ├── hooks/
│   │   ├── useAuth.ts                       # Auth hook (NEW)
│   │   ├── useLogin.ts                      # Login mutation (NEW)
│   │   ├── useRegister.ts                   # Register mutation (NEW)
│   │   ├── useProfile.ts                    # Profile query (NEW)
│   │   └── useWishList.ts                   # Wish list hook (NEW)
│   ├── lib/
│   │   ├── auth.ts                          # Auth utilities (NEW)
│   │   ├── authContext.tsx                  # Auth context provider (NEW)
│   │   └── client.ts                        # Updated with auth headers
│   └── types/
│       └── auth.ts                          # Auth type definitions (NEW)
└── tests/
    ├── components/
    │   ├── auth/
    │   │   ├── LoginForm.test.tsx           # (NEW)
    │   │   └── RegisterForm.test.tsx        # (NEW)
    │   └── wish-list/
    │       └── WishListButton.test.tsx      # (NEW)
    └── e2e/
        ├── auth-flow.spec.ts                # (NEW)
        └── wish-list.spec.ts                # (NEW)

contracts/
└── template.openapi.yaml                    # Updated with auth endpoints
```

**Structure Decision**: Web application structure (backend + frontend) selected. Backend follows Clean Architecture with domain, infrastructure, and config layers. Frontend uses Next.js App Router with component-based organization. All new files are marked (NEW).

**Note on Database**: Since we are not in production, the database will be recreated from scratch with the new authentication tables. No migration scripts are needed.

## Complexity Tracking

*No constitutional violations. All principles followed.*

## Design Decisions

### 1. Authentication Strategy: JWT with HTTP-only Cookies

**Decision**: Use JWT (JSON Web Tokens) stored in secure HTTP-only cookies for session management.

**Rationale**:

- HTTP-only cookies prevent XSS attacks (JavaScript cannot access tokens)
- Secure flag ensures tokens only sent over HTTPS
- JWT allows stateless authentication (no database lookup per request)
- Refresh token pattern enables long-lived sessions with security
- Industry standard with mature libraries (python-jose, PyJWT)

**Alternatives Considered**:

- **Session-based (server-side)**: Requires database lookup on every request, harder to scale
- **Local Storage JWT**: Vulnerable to XSS attacks
- **OAuth only**: Limits auth options, not all users have social accounts

**Implementation**:

- Access token: 15-minute expiration, stored in HTTP-only cookie
- Refresh token: 7-day expiration (or 30 days with "Remember Me"), stored in HTTP-only cookie
- Token contains: user_id, email, verification_status, issued_at, expires_at
- Refresh endpoint validates refresh token and issues new access token

### 2. Password Hashing: bcrypt with Cost Factor 12

**Decision**: Use bcrypt algorithm with cost factor 12 for password hashing.

**Rationale**:

- Industry standard for password hashing
- Adaptive algorithm (cost factor increases security over time)
- Cost factor 12 balances security and performance (~250ms per hash)
- Built-in salt generation
- Resistant to rainbow table and GPU-based attacks

**Alternatives Considered**:

- **Argon2**: More modern, but bcrypt is proven and widely supported
- **scrypt**: Good alternative, but bcrypt has better Python library support
- **PBKDF2**: Less resistant to GPU attacks than bcrypt

**Implementation**:

- Use `passlib` library with bcrypt backend
- Default cost factor: 12
- Automatic salt generation
- Password verification uses constant-time comparison

### 3. Email Service: Abstract Interface with SMTP Implementation

**Decision**: Create EmailService interface with SMTP implementation, allowing future providers.

**Rationale**:

- Follows Dependency Inversion principle
- Easy to swap email providers (SendGrid, AWS SES, etc.) without changing use cases
- SMTP sufficient for MVP, can add specialized providers later
- Testable with mock email service

**Implementation**:

- EmailService interface defines send_email() method
- SMTPEmailService implements with Python smtplib
- Email templates use Jinja2 for HTML rendering
- Configuration via environment variables (SMTP_HOST, SMTP_PORT, etc.)

### 4. OAuth 2.0 with PKCE Integration: authlib Library

**Decision**: Use `authlib` library for OAuth 2.0 with PKCE (Proof Key for Code Exchange) integration with Google and Facebook.

**Rationale**:

- Official OAuth 2.0 library for Python with built-in PKCE support
- PKCE eliminates need to store client secrets in frontend (critical security improvement)
- Supports multiple providers with consistent interface
- Handles token refresh, state validation, code verifier/challenge generation
- Well-documented and actively maintained
- PKCE required by OAuth 2.0 Security Best Current Practice (RFC 8252)

**Implementation**:

- **PKCE Flow**:
  1. Frontend generates code_verifier (cryptographically random string)
  2. Frontend creates code_challenge = BASE64URL(SHA256(code_verifier))
  3. Redirect to provider with code_challenge and code_challenge_method=S256
  4. Provider callback returns authorization code
  5. Backend exchanges code + code_verifier for tokens (provider validates challenge)
- OAuth flow: Redirect to provider → Callback → Exchange code for token → Create/link user
- Store encrypted OAuth tokens for potential future API calls
- Allow linking multiple providers to one account (email matching)
- No client secrets stored in frontend (PKCE provides security)

### 5. Rate Limiting: Redis-backed Sliding Window

**Decision**: Implement rate limiting using Redis with sliding window algorithm.

**Rationale**:

- Prevents brute force attacks on login/registration
- Sliding window more accurate than fixed window
- Redis provides fast, distributed rate limiting
- Can scale across multiple backend instances

**Implementation**:

- Key: `ratelimit:{ip}:{endpoint}`
- Limit: 5 attempts per 15 minutes for login
- Limit: 3 attempts per hour for registration per IP
- Return 429 Too Many Requests with Retry-After header

### 6. Database Schema: Normalized with Soft Deletes

**Decision**: Normalize authentication tables, use soft deletes for users, keep audit log forever.

**Rationale**:

- Normalization reduces data redundancy
- Soft delete allows account recovery and prevents email reuse fraud
- Audit log required for security compliance and incident response
- Clear separation between active data and historical data

**Key Tables**:

- `users`: Core user data with `deleted_at` for soft deletes
- `user_sessions`: Active sessions with expiration
- `password_reset_tokens`: Single-use tokens with expiration
- `email_verification_tokens`: Single-use verification tokens
- `oauth_connections`: Linked social accounts
- `wish_list_items`: User-saved products
- `two_factor_auth`: 2FA configuration per user
- `audit_logs`: Immutable security event log

### 7. Frontend State Management: React Context + Custom Hooks

**Decision**: Use React Context for auth state with custom hooks for API operations.

**Rationale**:

- Built-in React solution, no external dependencies
- Custom hooks encapsulate auth logic for reusability
- Context provides global auth state across components
- Follows existing frontend patterns in the project

**Implementation**:

- AuthContext provides: user, isAuthenticated, isLoading
- useAuth hook: Access auth state and methods
- useLogin, useRegister hooks: API mutation hooks with loading/error states
- useProtectedRoute hook: Redirect if not authenticated

### 8. Error Handling: Generic Messages for Security

**Decision**: Return generic error messages for authentication failures to prevent user enumeration.

**Rationale**:

- Security best practice: don't reveal if email exists
- Prevents attacker from identifying valid accounts
- Applies to login, password reset, registration

**Implementation**:

- Login failure: "Invalid email or password" (don't specify which)
- Password reset: "If the email exists, a reset link was sent" (always success message)
- Registration with existing email: "Email already registered" (OK to reveal, user is trying to register)

### 9. Testing Strategy: Unit + Integration + E2E

**Decision**: Comprehensive testing at all levels following TDD.

**Test Levels**:

- **Unit Tests**: All use cases, entities, security utilities (100% coverage target)
- **Integration Tests**: All API endpoints, complete auth flows (registration → verification → login → logout)
- **E2E Tests**: Critical user journeys with Playwright (login, registration, password reset)
- **Contract Tests**: Validate API responses match OpenAPI spec

**Mocking Strategy**:

- Unit tests: Mock repositories, email service, external dependencies
- Integration tests: Use test database (SQLite or Postgres), mock external OAuth APIs
- E2E tests: Use staging environment with real database

### 10. Phased Implementation: MVP First, Then Enhancements

**Decision**: Implement core authentication (registration, login, logout) first, then add features iteratively.

**Phase 1 (MVP - P1)**:

- User registration with email/password
- Login/logout with JWT
- Email verification
- Password reset
- Basic profile management
- Link user_preferences to authenticated users

**Phase 2 (P2)**:

- Wish list functionality
- Social login (Google)
- Enhanced profile management (change email, delete account)

**Phase 3 (P3)**:

- Facebook OAuth
- Two-factor authentication (2FA)
- Advanced audit logging

**Rationale**: Delivers value incrementally, allows user feedback, reduces initial complexity.

## Integration Points

### 1. Existing User Preferences System

**Current State**: `user_preferences` table tracks anonymous session preferences (language, currency) by `session_id`. The `user_id` field exists but is nullable and unused.

**Integration Approach**:

- When user registers or logs in for the first time, link existing session preferences to user account
- Update `user_id` field in `user_preferences` table during authentication
- On subsequent logins, load user preferences from account (not just session)
- Synchronize preferences across devices for authenticated users

**Migration Strategy**:

- Anonymous users continue using session-based preferences
- Upon authentication, migrate session preferences to user account
- If user already has saved preferences, session preferences are discarded (user account preferences take precedence)

### 2. OpenAPI Spec and Type Generation

**Current State**: Backend generates Python models from OpenAPI spec; frontend generates TypeScript types.

**Integration Approach**:

- Add authentication endpoints to `contracts/template.openapi.yaml`
- Define request/response schemas for all auth operations
- Add securitySchemes for Bearer JWT authentication
- Mark authenticated endpoints with `security: [bearerAuth]`
- Regenerate types after spec changes

**Affected Endpoints**:

- All new `/api/auth/*` endpoints
- All new `/api/profile/*` endpoints
- Update existing endpoints that will support authenticated users
- Add `Authorization: Bearer <token>` header documentation

### 3. Frontend Header Component

**Current State**: Header has language selector and currency selector.

**Integration Approach**:

- Add user menu dropdown when authenticated (shows user name, profile link, logout)
- Show "Login" and "Sign Up" buttons when not authenticated
- Display user avatar or initials in authenticated state
- Add loading state while checking authentication

**Implementation**:

- Wrap Header in AuthContext to access auth state
- Use `useAuth()` hook to get current user
- Conditionally render based on `isAuthenticated` flag

### 4. CMS (Strapi) - No Integration Required

**Decision**: Keep authentication completely separate from Strapi.

**Rationale**:

- Strapi manages content, not end-user accounts
- Backend API handles all authentication
- No need for Strapi Users & Permissions plugin for this use case
- Cleaner separation of concerns

### 5. Redis Caching

**Current State**: Redis used for caching CMS content and user preferences.

**Integration Approach**:

- Cache validated JWT tokens for fast authentication checks (5-minute TTL)
- Cache rate limit counters (15-minute TTL)
- Cache user profile data for authenticated users (10-minute TTL)
- Invalidate cache on user profile updates, password changes, or logout

**Cache Keys**:

- `auth:token:{token_hash}` → user_id (for token validation)
- `auth:ratelimit:{ip}:{endpoint}` → attempt count
- `auth:user:{user_id}` → user profile object

## Security Considerations

1. **Password Storage**: Never store plaintext passwords; use bcrypt with cost 12
2. **Token Security**: JWT stored in HTTP-only, Secure, SameSite=Strict cookies
3. **CSRF Protection**: Use SameSite cookies + CSRF tokens for state-changing operations
4. **Rate Limiting**: Prevent brute force attacks on authentication endpoints
5. **Input Validation**: Validate and sanitize all user inputs (email, password, names)
6. **SQL Injection**: Use SQLAlchemy ORM with parameterized queries (never raw SQL)
7. **XSS Prevention**: Sanitize user-generated content (display names) before rendering
8. **OAuth 2.0 PKCE Security**: Use PKCE for all OAuth flows (no client secrets in frontend), validate state parameter, HTTPS callback URLs only
9. **Token Expiration**: Short-lived access tokens (15 min), longer refresh tokens (7 days)
10. **Audit Logging**: Log all authentication events for security monitoring

## Performance Optimizations

1. **JWT Validation Caching**: Cache decoded JWT in Redis for 5 minutes (avoids repeated verification)
2. **Database Indexing**: Index users.email, user_sessions.token, user_sessions.user_id
3. **Connection Pooling**: Use SQLAlchemy connection pool (min 5, max 20 connections)
4. **Async Operations**: All database and external operations use async/await
5. **Email Sending**: Send emails asynchronously (background tasks) to avoid blocking requests
6. **Lazy Loading**: Load user profile data only when needed (not on every request)
7. **Query Optimization**: Use select_related/joinedload for related entities to prevent N+1 queries

## Database Schema

### Tables to Create

- users (id, email, hashed_password, display_name, email_verified, created_at, updated_at, deleted_at)
- user_sessions (id, user_id, token_hash, expires_at, remember_me, created_at)
- password_reset_tokens (id, user_id, token, expires_at, used, created_at)
- email_verification_tokens (id, user_id, email, token, expires_at, verified, created_at)
- oauth_connections (id, user_id, provider, provider_user_id, access_token_encrypted, created_at)
- wish_list_items (id, user_id, product_id, created_at)
- two_factor_auth (id, user_id, secret_encrypted, backup_codes_encrypted, enabled, created_at)
- audit_logs (id, user_id, event_type, ip_address, user_agent, success, created_at)

**Table to Modify**:

- user_preferences: Add foreign key constraint on user_id → users.id

**Indexes to Create**:

- users: (email UNIQUE), (deleted_at)
- user_sessions: (token_hash UNIQUE), (user_id), (expires_at)
- password_reset_tokens: (token UNIQUE), (user_id), (expires_at)
- email_verification_tokens: (token UNIQUE), (user_id), (expires_at)
- oauth_connections: (provider, provider_user_id UNIQUE), (user_id)
- wish_list_items: (user_id, product_id UNIQUE)
- audit_logs: (user_id), (event_type), (created_at)

### Rollback Plan

If issues arise:

1. Drop authentication tables from database (since not in production)
2. Remove authentication routes from API
3. Restore previous user_preferences behavior (session-only)
4. Can recreate database from scratch if needed

## Next Steps

1. **User Approval Required**: This plan must be approved before implementation
2. **Phase 0**: Complete `research.md` (auth libraries, OAuth 2.0 PKCE providers, security best practices)
3. **Phase 1**: Complete `data-model.md` (detailed database schema and ERD)
4. **Phase 1**: Complete `quickstart.md` (developer guide for using the auth system)
5. **Phase 1**: Complete `contracts/` (API request/response examples)
6. **Phase 2**: Generate `tasks.md` using `/speckit.tasks` command
7. **Phase 3**: Begin TDD implementation following tasks.md

## Open Questions for User

1. **Email Service**: Should we use SMTP (simple, self-hosted) or integrate with a service like SendGrid/AWS SES from the start?
   - **Recommendation**: Start with SMTP for MVP, add SendGrid later if needed

2. **Social Login Priority**: Should we implement both Google and Facebook in Phase 2, or start with just Google?
   - **Recommendation**: Start with Google only (most popular), add Facebook in Phase 3

3. **Email Verification Requirement**: Should users be blocked from using the site until email is verified, or allow access with limited features?
   - **Recommendation**: Allow access to browsing/searching, require verification for wish list and reviews

4. **Session Duration**: Default session duration of 7 days, or different preference?
   - **Recommendation**: 7 days standard, 30 days with "Remember Me"

5. **2FA Priority**: Should 2FA be in MVP (Phase 1) or later phase?
   - **Recommendation**: Defer to Phase 3 (low initial adoption, adds complexity)
