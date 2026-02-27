<!-- Copyright (c) 2026 Affilibuster by Ronen Druker. -->

# Data Processing Inventory

**GDPR Article 30 — Records of processing activities**

## Overview

This document maintains a comprehensive record of all personal data processing activities performed by Affilibuster,
as required by GDPR Article 30.

---

## Controller Information

- **Controller**: Affilibuster by Ronen Druker
- **Contact**: See privacy policy for DPO contact details
- **Purpose**: Eco-friendly affiliate product platform

---

## Processing Activities

### 1. User Registration & Authentication

| Field | Value |
|-------|-------|
| **Purpose** | Account creation and authentication |
| **Lawful basis** | Contract performance (Art. 6(1)(b)) |
| **Data categories** | Email address, display name, password (bcrypt hash) |
| **Data subjects** | Registered users |
| **Recipients** | None (internal processing only) |
| **Transfers** | None (EU-based infrastructure) |
| **Retention** | Active until account deletion + 30 days grace period |
| **Security measures** | Bcrypt password hashing, HTTPS, HttpOnly cookies, rate limiting |

### 2. Session Management

| Field | Value |
|-------|-------|
| **Purpose** | Maintaining authenticated sessions |
| **Lawful basis** | Contract performance (Art. 6(1)(b)) |
| **Data categories** | Session token hash, expiration, remember_me flag |
| **Data subjects** | Authenticated users |
| **Recipients** | None |
| **Transfers** | None |
| **Retention** | 7 days (standard) / 30 days (remember me), auto-purged |
| **Security measures** | SHA-256 hashed tokens, HttpOnly Secure cookies, SameSite policy |

### 3. Cookie Consent Management

| Field | Value |
|-------|-------|
| **Purpose** | Recording and managing user consent for cookies |
| **Lawful basis** | Legal obligation (Art. 7(1) — demonstrating consent) + Legitimate interest |
| **Data categories** | Consent decision, categories, hashed IP, session ID, timestamp, version |
| **Data subjects** | All website visitors who interact with consent banner |
| **Recipients** | None |
| **Transfers** | None |
| **Retention** | Indefinite (required for audit trail) |
| **Security measures** | Salted SHA-256 IP hashing, immutable records, no user-agent stored |

### 4. User Preferences

| Field | Value |
|-------|-------|
| **Purpose** | Storing language and currency preferences |
| **Lawful basis** | Contract performance (Art. 6(1)(b)) |
| **Data categories** | Language code, currency code, session/user ID |
| **Data subjects** | All website visitors (anonymous via session) and registered users |
| **Recipients** | None |
| **Transfers** | None |
| **Retention** | 30 days (session-based) / until account deletion (user-based) |
| **Security measures** | Redis cache with TTL, database with access controls |

### 5. Request Logging

| Field | Value |
|-------|-------|
| **Purpose** | Security monitoring, debugging, abuse detection |
| **Lawful basis** | Legitimate interest (Art. 6(1)(f)) — see LIA document |
| **Data categories** | Anonymized IP, HTTP method, path, status code, response time |
| **Data subjects** | All website visitors |
| **Recipients** | None |
| **Transfers** | None |
| **Retention** | Bounded by Docker log rotation (10MB x 5 files per container) |
| **Security measures** | IP anonymization (last octet zeroed), header redaction, no user-agent |

### 6. Email Communications

| Field | Value |
|-------|-------|
| **Purpose** | Email verification, password reset |
| **Lawful basis** | Contract performance (Art. 6(1)(b)) |
| **Data categories** | Email address, verification/reset tokens |
| **Data subjects** | Registered users |
| **Recipients** | SMTP email service provider |
| **Transfers** | Email transits through SMTP provider (processor agreement required) |
| **Retention** | Tokens expire after use or time limit |
| **Security measures** | Token hashing, single-use tokens, TLS for SMTP |

### 7. Password Reset

| Field | Value |
|-------|-------|
| **Purpose** | Enabling users to reset forgotten passwords |
| **Lawful basis** | Contract performance (Art. 6(1)(b)) |
| **Data categories** | Email address, reset token hash |
| **Data subjects** | Registered users who request password reset |
| **Recipients** | None (token sent via email) |
| **Transfers** | None |
| **Retention** | Tokens auto-expire, cleaned up by data retention script |
| **Security measures** | Hashed tokens, rate limiting (3/minute), anti-enumeration response |

---

## Data Subject Rights Implementation

| Right | Article | Implementation |
|-------|---------|---------------|
| Right of access | Art. 15 | GET `/v1/profile/export` — JSON export of all personal data |
| Right to rectification | Art. 16 | PATCH `/v1/profile` — update display name |
| Right to erasure | Art. 17 | DELETE `/v1/profile` — soft delete + 30-day purge |
| Right to data portability | Art. 20 | GET `/v1/profile/export` — machine-readable JSON format |
| Right to withdraw consent | Art. 7(3) | POST `/v1/consent` with action `revoke` |
| Right to restriction | Art. 18 | Contact DPO for manual processing |
| Right to object | Art. 21 | Contact DPO for manual processing |

---

## Technical & Organizational Measures (Art. 32)

### Encryption

- HTTPS/TLS for all data in transit
- Bcrypt for password hashing
- SHA-256 for session tokens and consent IP hashing

### Access Controls

- Role-based access in CMS (Strapi)
- Authentication required for all user data operations
- HttpOnly, Secure, SameSite cookies

### Data Minimization

- IP addresses anonymized in logs (last octet zeroed)
- IP addresses hashed in consent records (salted SHA-256)
- User-agent strings excluded from all storage
- Sensitive headers redacted in logs

### Availability & Resilience

- Docker containerization with health checks
- Automated database backups (daily Strapi export)
- Log rotation preventing disk exhaustion

### Rate Limiting

- Login: 5 requests/minute
- Registration: 3 requests/minute
- Password reset: 3 requests/minute
- Consent recording: 10 requests/minute
- DSAR export: 3 requests/hour

---

## Third-Party Processors

| Processor | Purpose | Data Shared | Agreement |
|-----------|---------|-------------|-----------|
| SMTP Provider | Email delivery | Email addresses, verification links | DPA required |
| Hosting Provider | Infrastructure | All data (encrypted at rest) | DPA required |

**Note**: Affilibuster does not use any third-party analytics, tracking, or advertising services. Zero third-party
cookies are set.

---

## Review Schedule

This inventory should be reviewed and updated:

- When new personal data processing activities are introduced
- When existing processing activities change
- At minimum annually
- After any data breach incident

**Last reviewed**: 2026-02-27
