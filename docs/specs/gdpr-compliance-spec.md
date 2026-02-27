<!-- Copyright (c) 2026 Affilibuster by Ronen Druker. -->

# GDPR Full Compliance Specification

**Created**: 2026-02-27
**Status**: In Progress

## Overview

This specification documents the GDPR compliance analysis and remediation plan for Affilibuster. The platform serves EU
users (multi-language including Italian) and must comply with GDPR requirements.

## Current State (~75% Compliant)

### Already Implemented

- **Cookie consent banner** with granular categories (necessary, analytics, marketing)
- **Consent audit trail** - immutable database records per consent event
- **Right to erasure** (Article 17) - DELETE `/profile` endpoint
- **DSAR export** (Article 15/20) - GET `/profile/export` with JSON download
- **Privacy policy, Terms of Service, Cookie Policy** pages served from CMS
- **Data retention** - `cleanup_data.py` script for expired data
- **Secure sessions** - HttpOnly, SameSite cookies with configurable Secure flag
- **Zero third-party tracking** - no Google Analytics, Facebook Pixel, etc.
- **DNT (Do Not Track)** detection in consent hook

### Gaps Identified and Remediated

The following items were identified as gaps and addressed in this implementation:

## Implementation Items

### 1. Consent Cookie `Secure` Flag (GDPR Art. 32 - Security)

**Problem**: Consent cookie lacked `Secure` flag, allowing transmission over HTTP.

**Solution**: Added conditional `Secure` flag to `writeConsentCookie()` based on `window.location.protocol === 'https:'`.

**Files Modified**:
- `the-green-brother/src/lib/consent/ssr.ts` - Added `isSecureContext()` function
- `the-green-brother/src/lib/consent/useConsent.ts` - Conditional Secure flag
- Tests updated with full coverage

### 2. IP Anonymization in Request Logging (GDPR Art. 5(1)(c) - Data Minimization)

**Problem**: Raw IP addresses logged in request middleware; user-agent strings included in access logs.

**Solution**: Created `IPAnonymizer` domain service with two methods:
- `anonymize()` - Zeros last octet (IPv4) or last 80 bits (IPv6 /48 prefix)
- `hash_ip()` - Salted SHA-256 for consent audit trail

Applied in `RequestLoggingMiddleware` with configurable `anonymize_request_ips` setting. Removed user-agent from
INFO-level and ERROR-level log extra fields.

**Files Created/Modified**:
- `backend/src/affilibuster_backend/domain/services/ip_anonymizer.py` (new)
- `backend/src/affilibuster_backend/infrastructure/middleware/request_logging.py` (modified)
- `backend/src/affilibuster_backend/config/settings.py` (new settings)
- Tests: 16 anonymizer tests + 5 middleware IP tests

### 3. Consent Record IP Hashing (GDPR Art. 5(1)(c), Art. 25 - Data Protection by Design)

**Problem**: Consent records stored raw IP addresses and user-agent strings.

**Solution**: Hash IPs at write time using salted SHA-256 before database storage. Set `user_agent=None` (not stored).
Created Alembic migration to NULL all existing raw IP and user-agent values.

**Files Created/Modified**:
- `backend/src/affilibuster_backend/infrastructure/api/routes/consent.py` (modified)
- `backend/src/affilibuster_backend/infrastructure/database/alembic/versions/006_null_raw_consent_ips.py` (new)
- Tests updated to verify hashed IPs and null user-agent

### 4. Data Cleanup Scheduling (GDPR Art. 5(1)(e) - Storage Limitation)

**Problem**: Data retention cleanup script existed but had no automated scheduling.

**Solution**: GitHub Actions workflow running daily at 3 AM UTC, executing
`docker compose exec -T backend uv run task cleanup` via SSH. Includes Telegram failure notification.

**File Created**:
- `.github/workflows/data-retention-cleanup.yaml`

### 5. Log Retention Configuration (GDPR Art. 5(1)(e))

**Problem**: Docker containers had no log size limits, risking unbounded PII accumulation.

**Solution**: Added `logging: driver: json-file` with `max-size: 10m`, `max-file: 5` to all 7 services in
`docker-compose.yaml`.

**File Modified**:
- `docker-compose.yaml`

### 6. Rate Limiting on Sensitive Endpoints (GDPR Art. 32 - Security)

**Problem**: No rate limiting on authentication and consent endpoints.

**Solution**: Rate limiting using `slowapi` library with per-endpoint limits:
- Login: 5/min
- Register: 3/min
- Forgot password: 3/min
- Consent: 10/min
- DSAR export: 3/hour

**Files**: TBD (pending implementation)

### 7. Newsletter Consent Mechanism (GDPR Art. 7 - Consent)

**Problem**: Newsletter signup CTA exists but lacks explicit consent checkbox.

**Solution**: Full-stack implementation with:
- CMS-driven consent label
- Required consent checkbox
- Double opt-in email verification
- Unsubscribe endpoint
- Database table for subscriptions

**Files**: TBD (pending implementation)

### 8. E2E Cookie Consent Tests

**Problem**: E2E tests contain placeholder assertions (`expect(true).toBe(true)`).

**Solution**: Real Playwright assertions for banner display, accept/reject flows, category toggles, persistence, and
withdrawal.

**Files**: TBD (pending implementation)

### 9. GDPR Documentation

**New documents**:
- `docs/gdpr/breach-notification-procedure.md` - 72-hour notification timeline
- `docs/gdpr/legitimate-interest-assessment.md` - LIA for logging + consent metadata
- `docs/gdpr/data-processing-inventory.md` - All personal data mapped to lawful bases

## GDPR Article Coverage

| Article | Requirement | Status |
|---------|------------|--------|
| Art. 5(1)(a) | Lawfulness, fairness, transparency | Privacy policy + consent banner |
| Art. 5(1)(b) | Purpose limitation | Data used only for stated purposes |
| Art. 5(1)(c) | Data minimization | IP anonymization + hashing, no user-agent storage |
| Art. 5(1)(d) | Accuracy | User profile management |
| Art. 5(1)(e) | Storage limitation | Data retention cleanup + log rotation |
| Art. 5(1)(f) | Integrity and confidentiality | HTTPS, secure cookies, rate limiting |
| Art. 6 | Lawful basis | Consent for cookies, legitimate interest for logging |
| Art. 7 | Conditions for consent | Granular consent banner, withdrawal mechanism |
| Art. 12-14 | Information obligations | Privacy policy, cookie policy |
| Art. 15 | Right of access | DSAR export endpoint |
| Art. 17 | Right to erasure | Profile deletion endpoint |
| Art. 20 | Right to data portability | JSON export format |
| Art. 25 | Data protection by design | IP hashing at write time, minimal data collection |
| Art. 32 | Security of processing | HTTPS, rate limiting, secure cookies |
| Art. 33-34 | Breach notification | Procedure documentation |
