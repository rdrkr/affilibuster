# Feature Specification: Production Security Hardening

**Feature Branch**: `007-production-security`
**Created**: 2025-12-15
**Status**: Draft
**Input**: Security architecture discussion, ROADMAP.md Section 11 (Security & Compliance)

## Overview

This specification defines the security hardening measures for the Affilibuster platform across all three tiers (TheGreenBrother frontend, Backend API, Strapi CMS) to prepare for production deployment. The focus is on defense-in-depth security controls including rate limiting, two-factor authentication, CORS enforcement, security headers, and monitoring.

## Security Requirements

### Architecture Constraints

**Current Architecture**:
```
Internet → TheGreenBrother (public) → Backend API (public, CORS-restricted) → Strapi CMS (public, token-protected)
                                                                            ↓
                                                                        /admin (public, 2FA required)
```

**Access Requirements**:
- **Backend API**: Should only be accessible by TheGreenBrother frontend (CORS-enforced)
- **Strapi API** (`/api/*`): Should only be accessible by Backend (bearer token protected)
- **Strapi Admin** (`/admin`): Should be accessible by company employees working remotely

**Constraints**:
- Employees work remotely (no static IPs or VPN) → Cannot use IP allowlisting for admin access
- Backend must be public for client-side API calls → Must use CORS + rate limiting
- Strapi must be public for admin access → Must use strong authentication + 2FA

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rate Limit Protection for Strapi Admin (Priority: P1)

As a security administrator, I want brute force login protection on the Strapi admin panel so that attackers cannot guess admin passwords through repeated login attempts.

**Why this priority**: Critical security control to prevent unauthorized access to the CMS, which controls all site content.

**Independent Test**: Can be tested by attempting multiple failed login attempts and verifying that the account is locked or requests are rate limited after a threshold.

**Acceptance Scenarios**:

1. **Given** I am on the Strapi admin login page, **When** I submit 5 failed login attempts within 15 minutes, **Then** further login attempts from my IP are blocked for 15 minutes with a 429 status code

2. **Given** my IP was rate limited, **When** 15 minutes have elapsed, **Then** I can attempt to login again

3. **Given** I successfully login before hitting the rate limit, **When** I access admin features, **Then** rate limiting does not affect my authenticated session

4. **Given** rate limiting is active, **When** I check the server logs, **Then** I can see which IPs are being rate limited and why

---

### User Story 2 - Two-Factor Authentication for Strapi Admins (Priority: P1)

As an admin user, I want to enable two-factor authentication (2FA) on my account so that my login is protected even if my password is compromised.

**Why this priority**: Essential defense-in-depth control for admin accounts with full content control. Prevents account takeover from password leaks.

**Independent Test**: Can be tested by enabling 2FA, logging out, and verifying that login requires both password and 2FA code.

**Acceptance Scenarios**:

1. **Given** I am a Strapi admin user, **When** I navigate to my profile settings, **Then** I see an option to enable two-factor authentication

2. **Given** I enable 2FA, **When** I scan the QR code with my authenticator app, **Then** I am prompted to enter a verification code to confirm setup

3. **Given** I have 2FA enabled, **When** I logout and login again, **Then** I must provide both my password and a valid 2FA code

4. **Given** I lose access to my authenticator app, **When** I use my backup recovery codes, **Then** I can still access my account and reconfigure 2FA

5. **Given** 2FA is enforced for all admins, **When** a new admin user is created, **Then** they are required to set up 2FA before accessing any admin features

---

### User Story 3 - Backend API Rate Limiting (Priority: P1)

As a system administrator, I want rate limiting on backend API endpoints so that the API is protected from abuse, DDoS attacks, and brute force attempts.

**Why this priority**: Critical for API availability and preventing abuse. Protects against both malicious attacks and legitimate traffic spikes.

**Independent Test**: Can be tested by sending rapid requests to an endpoint and verifying that requests are throttled after exceeding the limit.

**Acceptance Scenarios**:

1. **Given** I am an authenticated user, **When** I make more than 100 requests per minute to any API endpoint, **Then** I receive a 429 Too Many Requests response with a Retry-After header

2. **Given** I am attempting to login, **When** I make more than 5 login attempts per minute from the same IP, **Then** further attempts are blocked for 5 minutes

3. **Given** rate limiting is active, **When** I receive a 429 response, **Then** the response includes clear information about when I can retry

4. **Given** I am a legitimate user within rate limits, **When** I use the API normally, **Then** rate limiting does not affect my requests

---

### User Story 4 - Security Headers for TheGreenBrother (Priority: P2)

As a security administrator, I want comprehensive security headers on all frontend responses so that the site is protected against common web vulnerabilities (XSS, clickjacking, etc.).

**Why this priority**: Important security control for browser-based attacks. Should be implemented before production but not blocking for MVP.

**Independent Test**: Can be tested by inspecting HTTP response headers and verifying all required security headers are present with correct values.

**Acceptance Scenarios**:

1. **Given** I load any page on TheGreenBrother, **When** I inspect response headers, **Then** I see all required security headers: `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

2. **Given** I am on an HTTPS page, **When** I check the HSTS header, **Then** it has a max-age of at least 1 year and includes subdomains

3. **Given** I try to embed TheGreenBrother in an iframe, **When** the page loads, **Then** it is blocked due to X-Frame-Options: SAMEORIGIN

4. **Given** security headers are configured, **When** I run a security scanner (like Mozilla Observatory), **Then** the site receives an A or A+ rating

---

### User Story 5 - CORS Enforcement for Backend API (Priority: P1)

As a security administrator, I want strict CORS enforcement on the backend API so that only requests from authorized domains (thegreenbrother.com) are accepted.

**Why this priority**: Critical security control to prevent unauthorized domains from accessing the API and potentially stealing user data or making unauthorized requests.

**Independent Test**: Can be tested by making API requests from unauthorized domains and verifying they are rejected, while authorized domains are allowed.

**Acceptance Scenarios**:

1. **Given** I make an API request from `https://thegreenbrother.com`, **When** the request is sent, **Then** it is accepted and processed normally

2. **Given** I make an API request from `https://www.thegreenbrother.com`, **When** the request is sent, **Then** it is accepted and processed normally

3. **Given** I make an API request from `https://malicious-site.com`, **When** the browser sends a preflight OPTIONS request, **Then** the server rejects it with no CORS headers

4. **Given** CORS is configured for production, **When** I inspect the allowed origins, **Then** I only see the production domains (not `localhost` or development URLs)

---

## Technical Requirements

### 1. Strapi Security Enhancements

**Rate Limiting**:
- Install: `npm install koa-ratelimit` in `cms/` directory
- Configure rate limiting middleware in `cms/config/middlewares.ts`
- Global limit: 100 requests per 15 minutes per IP
- Login endpoint limit: 5 attempts per 15 minutes per IP
- Store rate limit state in Redis (shared with backend cache)

**Two-Factor Authentication**:
- Enable Strapi's built-in 2FA support (available in Strapi 4.0+)
- Configure in Settings → Users & Permissions → Two-Factor Authentication
- Enforce 2FA for all admin role users
- Provide recovery codes (10 codes, single-use)
- Document 2FA setup process for new admins

**Strong Password Policy**:
- Minimum 16 characters
- Require complexity (uppercase, lowercase, numbers, symbols)
- Recommend password managers in documentation
- Configure in Strapi security settings

---

### 2. Backend API Security Enhancements

**Rate Limiting**:
- Install: `uv add slowapi` in `backend/` directory
- Configure Slowapi with Redis backend for distributed rate limiting
- Default limit: 100 requests per minute per IP
- Login endpoint: 5 requests per minute per IP
- Registration endpoint: 3 requests per hour per IP
- Password reset: 3 requests per hour per IP
- Add rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Request Size Limits**:
- Maximum request body size: 1MB (configurable)
- Maximum file upload size: 10MB
- Reject requests exceeding limits with 413 Payload Too Large

**CORS Configuration** (Already Implemented ✅):
- Production origins: `https://thegreenbrother.com`, `https://www.thegreenbrother.com`
- Allow credentials: `true`
- Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- Allowed headers: `Content-Type`, `Authorization`, `X-Requested-With`
- Max age: 86400 (24 hours)

---

### 3. TheGreenBrother Security Headers

**Security Headers** (via Next.js config):
```javascript
{
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-DNS-Prefetch-Control': 'on'
}
```

**Content Security Policy (CSP)** (Future Enhancement):
- Initially use permissive CSP to avoid breaking functionality
- Gradually tighten based on violation reports
- Consider using CSP report-only mode first

---

### 4. Monitoring & Alerting

**Security Monitoring**:
- Log all authentication events (login, logout, failed attempts, 2FA usage)
- Log all rate limiting events (429 responses, blocked IPs)
- Alert on suspicious patterns:
  - Multiple failed login attempts from same IP
  - High rate of 429 responses
  - Unusual geographic login patterns
  - Admin account creation/modification

**Error Tracking**:
- Integrate Sentry or similar (optional, medium priority)
- Track authentication errors
- Track rate limit violations
- Track CORS violations

---

## Implementation Tasks

### Phase 1: Strapi Security (P1) - Estimated 2-3 days

**Task 1.1**: Install and configure koa-ratelimit
- [ ] Install `koa-ratelimit` and `ioredis` in cms directory
- [ ] Configure Redis connection in Strapi
- [ ] Add rate limiting middleware to `cms/config/middlewares.ts`
- [ ] Test rate limiting with manual requests
- [ ] Write unit tests for rate limiting logic

**Task 1.2**: Enable and enforce Two-Factor Authentication
- [ ] Enable 2FA in Strapi admin settings
- [ ] Document 2FA setup process for admins
- [ ] Generate and distribute recovery codes
- [ ] Test 2FA login flow
- [ ] Verify backup recovery code flow works

**Task 1.3**: Configure strong password policy
- [ ] Set minimum password length to 16 characters
- [ ] Enable password complexity requirements
- [ ] Update user documentation with password requirements
- [ ] Test password validation on registration and password change

---

### Phase 2: Backend API Security (P1) - Estimated 3-4 days

**Task 2.1**: Install and configure Slowapi rate limiting
- [ ] Install `slowapi` via uv
- [ ] Configure Slowapi with Redis backend
- [ ] Add global rate limiter to FastAPI app
- [ ] Add endpoint-specific rate limits (login, register, password reset)
- [ ] Add rate limit headers to responses
- [ ] Test rate limiting with automated scripts
- [ ] Write unit and integration tests

**Task 2.2**: Add request size limits
- [ ] Configure max request body size in FastAPI middleware
- [ ] Add file upload size validation
- [ ] Return 413 Payload Too Large for oversized requests
- [ ] Test with large payloads
- [ ] Document size limits in API documentation

**Task 2.3**: Verify and enhance CORS configuration
- [ ] Review current CORS settings in `main.py`
- [ ] Verify production-only origins (no localhost)
- [ ] Test CORS with authorized domains
- [ ] Test CORS rejection with unauthorized domains
- [ ] Add CORS configuration documentation

---

### Phase 3: TheGreenBrother Security Headers (P2) - Estimated 1-2 days

**Task 3.1**: Add security headers to Next.js config
- [ ] Update `the-green-brother/next.config.js` with security headers
- [ ] Add HSTS header with 2-year max-age
- [ ] Add X-Frame-Options: SAMEORIGIN
- [ ] Add X-Content-Type-Options: nosniff
- [ ] Add Referrer-Policy: origin-when-cross-origin
- [ ] Add Permissions-Policy to disable unused features
- [ ] Test headers are present on all routes
- [ ] Verify headers with security scanner (Mozilla Observatory, Security Headers)

**Task 3.2**: Document security headers
- [ ] Update CLAUDE.md with security header requirements
- [ ] Document purpose of each header
- [ ] Add security header checklist to deployment guide

---

### Phase 4: Monitoring & Alerting (P2) - Estimated 2-3 days

**Task 4.1**: Implement security event logging
- [ ] Add authentication event logging (backend)
- [ ] Add rate limit event logging (backend and Strapi)
- [ ] Add CORS violation logging (backend)
- [ ] Structure logs for easy parsing and alerting
- [ ] Test log output for all event types

**Task 4.2**: Set up basic alerting (optional)
- [ ] Configure alert thresholds (failed logins, rate limits)
- [ ] Set up email/Slack notifications for critical events
- [ ] Test alerting with simulated attacks
- [ ] Document alerting configuration

---

### Phase 5: Testing & Validation (P1) - Estimated 2-3 days

**Task 5.1**: Security testing
- [ ] Manual penetration testing for rate limiting
- [ ] Test 2FA bypass attempts
- [ ] Test CORS bypass attempts
- [ ] Test request size limit enforcement
- [ ] Run automated security scanner (OWASP ZAP, Nikto)

**Task 5.2**: Write automated security tests
- [ ] Rate limiting integration tests (backend)
- [ ] 2FA E2E tests (Strapi admin)
- [ ] CORS integration tests (backend)
- [ ] Security header verification tests (frontend)
- [ ] Achieve 100% coverage for security-critical code

**Task 5.3**: Documentation
- [ ] Update CLAUDE.md with security architecture
- [ ] Create security runbook for incidents
- [ ] Document rate limit thresholds and tuning
- [ ] Create 2FA setup guide for new admins
- [ ] Update deployment checklist with security verification steps

---

## Security Architecture Summary

### Layer 1: TheGreenBrother (Frontend)
- **Public Access**: Yes (intended)
- **Security Controls**:
  - Security headers (HSTS, X-Frame-Options, CSP, etc.)
  - Content Security Policy
  - User authentication for personalized features
  - HTTPS enforced

### Layer 2: Backend API
- **Public Access**: Yes (required for client-side calls)
- **Security Controls**:
  - CORS restricted to `thegreenbrother.com` only ✅
  - Rate limiting (global + endpoint-specific)
  - Request size limits
  - JWT authentication for user-specific endpoints
  - HTTPS enforced
  - Security headers

### Layer 3: Strapi CMS
- **Public Access**: Yes (admin panel requires remote access)
- **Security Controls**:
  - **API** (`/api/*`): Bearer token authentication ✅
  - **Admin** (`/admin`):
    - Strong password policy (16+ chars)
    - Two-factor authentication (enforced)
    - Rate limiting on login endpoint
    - Account lockout after repeated failures
  - HTTPS enforced

---

## Success Criteria

**Phase 1 Complete**: Strapi admin protected with 2FA and rate limiting
**Phase 2 Complete**: Backend API has rate limiting and request size controls
**Phase 3 Complete**: TheGreenBrother has all required security headers
**Phase 4 Complete**: Security monitoring and logging operational
**Phase 5 Complete**: All security tests passing, documentation complete

**Production Ready**:
- [ ] All P1 tasks completed
- [ ] Security scanner reports A or A+ rating
- [ ] Manual penetration testing passed
- [ ] 100% test coverage for security-critical code
- [ ] Security runbook documented
- [ ] Deployment checklist includes security verification

---

## References

- ROADMAP.md Section 11 (Security & Compliance)
- Constitution Security & Compliance Principles
- OWASP Top 10 Web Application Security Risks
- Mozilla Web Security Guidelines
- Strapi Security Documentation: https://docs.strapi.io/dev-docs/admin-panel-customization#authentication
- FastAPI Security: https://fastapi.tiangolo.com/advanced/security/
- Next.js Security Headers: https://nextjs.org/docs/advanced-features/security-headers

---

## Future Enhancements (Post-MVP)

- IP allowlisting when employees have VPN (optional)
- Web Application Firewall (WAF) via Cloudflare or similar
- DDoS protection via CDN
- Bot detection and mitigation
- API key rotation automation
- Security audit logging with tamper-proof storage
- Penetration testing by third-party security firm
- Bug bounty program
