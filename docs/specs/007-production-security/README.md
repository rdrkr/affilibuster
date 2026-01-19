# Spec 007: Production Security Hardening

**Status**: 🔴 Not Started
**Priority**: Critical (P1)
**Created**: 2025-12-15

## Overview

This specification defines the security hardening measures required to prepare the Affilibuster platform for production deployment. It covers defense-in-depth security controls across all three tiers: TheGreenBrother frontend, Backend API, and Strapi CMS.

## Key Features

1. **Rate Limiting**
   - Strapi admin login protection (prevent brute force)
   - Backend API global and endpoint-specific limits (prevent DDoS)
   - Redis-backed distributed rate limiting

2. **Two-Factor Authentication (2FA)**
   - Mandatory for all Strapi admin users
   - TOTP-based authentication
   - Recovery code support

3. **Security Headers**
   - HSTS, X-Frame-Options, CSP for TheGreenBrother
   - Protection against XSS, clickjacking, MIME sniffing

4. **Enhanced CORS**
   - Production-only allowed origins
   - Strict validation and rejection of unauthorized domains

5. **Monitoring & Logging**
   - Security event logging
   - Alert thresholds for suspicious activity
   - Incident response documentation

## Security Architecture

```
Internet → TheGreenBrother (public) → Backend API (public, CORS-restricted) → Strapi CMS (public, token-protected)
                                                                            ↓
                                                                        /admin (public, 2FA required)
```

### Access Controls

- **Backend API**: Public but restricted by CORS to `thegreenbrother.com` only
- **Strapi API** (`/api/*`): Public but protected by bearer token (only backend has token)
- **Strapi Admin** (`/admin`): Public but protected by strong passwords + 2FA (employees work remotely)

## Implementation Phases

- **Phase 1**: Strapi Security (2-3 days) - Rate limiting, 2FA, password policy
- **Phase 2**: Backend API Security (3-4 days) - Rate limiting, request size limits, CORS verification
- **Phase 3**: TheGreenBrother Security Headers (1-2 days) - Security headers, CSP
- **Phase 4**: Monitoring & Alerting (2-3 days) - Event logging, alerting setup
- **Phase 5**: Testing & Validation (2-3 days) - Security tests, penetration testing, documentation

**Total Estimated Effort**: 11-17 days

## Success Criteria

- [ ] All P1 tasks completed
- [ ] Security scanner reports A or A+ rating
- [ ] Manual penetration testing passed
- [ ] 100% test coverage for security-critical code
- [ ] Security runbook documented
- [ ] Deployment checklist includes security verification

## Documents

- [`spec.md`](./spec.md) - Full specification with user scenarios, technical requirements, and implementation tasks

## Related

- ROADMAP.md Section 11.0 (Production Security Hardening)
- Constitution Security & Compliance Principles
- Spec 002 (HTTPS Migration) - Foundation for secure communication
- Spec 004 (User Authentication) - User-level authentication

## References

- OWASP Top 10 Web Application Security Risks
- Mozilla Web Security Guidelines
- Strapi Security Best Practices
- FastAPI Security Documentation
- Next.js Security Headers Guide
