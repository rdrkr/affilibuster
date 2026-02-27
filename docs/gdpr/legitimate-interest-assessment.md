<!-- Copyright (c) 2026 Affilibuster by Ronen Druker. -->

# Legitimate Interest Assessment (LIA)

**GDPR Article 6(1)(f) — Processing necessary for legitimate interests**

## Overview

This document assesses the legitimate interests relied upon by Affilibuster for processing personal data that is not
covered by explicit consent. All consent-based processing (cookies, newsletter) is handled separately under Article 7.

---

## Assessment 1: Request Logging

### Purpose

Server access logging for security monitoring, debugging, and abuse detection.

### Three-Part Test

#### 1. Purpose Test — Is there a legitimate interest?

**Yes.** Security monitoring and abuse prevention are recognized legitimate interests under Recital 49 of the GDPR,
which explicitly mentions network and information security as a legitimate interest.

- Detect and prevent unauthorized access attempts
- Monitor for DDoS attacks and brute force attempts
- Debug application errors that affect users
- Maintain service availability and reliability

#### 2. Necessity Test — Is the processing necessary?

**Yes.** Request logging is the standard and least invasive method for achieving these security goals.

**Data minimization measures applied:**

- IP addresses are anonymized (last octet zeroed for IPv4, /48 prefix for IPv6)
- User-agent strings are excluded from INFO-level logs
- Sensitive headers (Authorization, Cookie, X-Session-Id, X-API-Key) are redacted
- Log retention is limited (10MB per file, 5 files max per container)
- Logs are not shared with third parties

#### 3. Balancing Test — Do the individual's rights override the interest?

**No.** The impact on individuals is minimal due to the extensive data minimization measures:

- Anonymized IPs cannot identify specific individuals
- No behavioral profiling is performed from logs
- Log data is used solely for security and debugging purposes
- Log retention is bounded and automatically rotated
- Individuals can exercise their rights (access, erasure) via DSAR export

### Conclusion

**Legitimate interest applies.** Request logging with anonymized IPs and redacted headers is proportionate and
necessary for security purposes.

---

## Assessment 2: Consent Metadata

### Purpose

Storing metadata alongside consent records for audit trail integrity and fraud prevention.

### Three-Part Test

#### 1. Purpose Test — Is there a legitimate interest?

**Yes.** Maintaining a reliable consent audit trail is both a legitimate interest and a legal obligation under
GDPR Article 7(1), which requires controllers to be able to demonstrate that consent was given.

Metadata stored:

- Hashed IP address (salted SHA-256, non-reversible)
- Session ID
- Timestamp
- Consent version

#### 2. Necessity Test — Is the processing necessary?

**Yes.** Consent metadata is necessary to:

- Prove that consent was validly obtained (Article 7(1))
- Detect fraudulent consent submissions
- Maintain audit trail integrity for regulatory compliance
- Enable consent withdrawal tracking

**Data minimization measures applied:**

- IP addresses are hashed with salt (non-reversible, cannot identify individuals)
- User-agent strings are NOT stored (explicitly set to NULL)
- Only minimal metadata is retained alongside the consent decision

#### 3. Balancing Test — Do the individual's rights override the interest?

**No.** The processing has negligible impact on individuals:

- Hashed IPs cannot be reversed to identify the individual
- Metadata is used only for audit purposes, not profiling
- Data subjects can view their consent records via DSAR export
- Data subjects can withdraw consent at any time

### Conclusion

**Legitimate interest applies** (also supported by legal obligation under Article 7(1)). Storing non-reversible
consent metadata is proportionate and necessary for demonstrating valid consent.

---

## Assessment 3: Session Management

### Purpose

Managing authenticated user sessions for service delivery and security.

### Three-Part Test

#### 1. Purpose Test — Is there a legitimate interest?

**Yes.** Session management is necessary for:

- Delivering the service to authenticated users (contract performance, Article 6(1)(b))
- Preventing session hijacking and unauthorized access (security)
- Enabling session invalidation on password change

#### 2. Necessity Test — Is the processing necessary?

**Yes.** Session tokens are the standard mechanism for stateful authentication.

**Data minimization measures applied:**

- Session tokens are hashed (SHA-256) before storage
- Sessions have configurable expiration (7 days default, 30 days with remember_me)
- Expired sessions are automatically cleaned up by the data retention script
- Deleted users' sessions are purged immediately

#### 3. Balancing Test — Do the individual's rights override the interest?

**No.** Session management is essential for the service and:

- Users can log out to invalidate sessions at any time
- Users can view active sessions via DSAR export
- Changing password invalidates all existing sessions
- Account deletion purges all session data

### Conclusion

**Contract performance (Article 6(1)(b))** is the primary lawful basis, with legitimate interest as secondary
justification for security monitoring of sessions.

---

## Summary

| Processing Activity | Lawful Basis | Data Minimization |
|---------------------|-------------|-------------------|
| Request logging | Legitimate interest (Art. 6(1)(f)) | Anonymized IPs, no user-agent, header redaction |
| Consent metadata | Legitimate interest + Legal obligation (Art. 7(1)) | Hashed IPs, no user-agent |
| Session management | Contract performance (Art. 6(1)(b)) | Hashed tokens, auto-expiration |
| Cookie consent | Explicit consent (Art. 6(1)(a)) | Granular categories, withdrawal mechanism |
| Account data | Contract performance (Art. 6(1)(b)) | Minimal required fields, right to erasure |
