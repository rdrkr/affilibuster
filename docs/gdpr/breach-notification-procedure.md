<!-- Copyright (c) 2026 Affilibuster by Ronen Druker. -->

# Data Breach Notification Procedure

**GDPR Articles 33 & 34 — Notification of a personal data breach**

## Overview

This document outlines the procedure for detecting, assessing, and reporting personal data breaches in compliance with
GDPR Articles 33 (notification to supervisory authority) and 34 (communication to data subjects).

## Definition

A personal data breach is any security incident leading to the accidental or unlawful destruction, loss, alteration,
unauthorized disclosure of, or access to, personal data.

## Timeline

| Time | Action |
|------|--------|
| T+0 | Breach detected or reported |
| T+1h | Initial assessment and containment |
| T+24h | Full impact assessment completed |
| T+72h | **Supervisory authority notified** (if required) |
| T+72h | Data subjects notified (if high risk to rights/freedoms) |

## Phase 1: Detection & Containment (T+0 to T+1h)

1. **Identify the breach**: Determine what happened, when, and what data is affected
2. **Contain the breach**: Take immediate action to stop ongoing unauthorized access
   - Revoke compromised credentials or tokens
   - Block affected IP addresses
   - Disable affected systems if necessary
3. **Preserve evidence**: Do not destroy logs or forensic data
4. **Notify the incident response team**: Contact the DPO and system administrators

## Phase 2: Assessment (T+1h to T+24h)

1. **Determine scope**: What personal data was affected?
   - User emails, display names
   - IP address hashes (non-reversible)
   - Consent records
   - Session metadata
2. **Determine affected individuals**: How many data subjects are impacted?
3. **Assess risk level**: Is there a risk to rights and freedoms of individuals?
   - **Low risk**: Hashed/encrypted data only, no identifying information exposed
   - **Medium risk**: Email addresses exposed but no passwords
   - **High risk**: Passwords, financial data, or sensitive personal data exposed
4. **Document findings**: Record all assessment details for the breach register

## Phase 3: Notification (T+24h to T+72h)

### Supervisory Authority (Article 33)

**Required when**: The breach is likely to result in a risk to rights and freedoms.

**Not required when**: The breach is unlikely to result in a risk (e.g., encrypted data only).

**Notification must include**:

- Nature of the breach (categories and approximate number of data subjects)
- Name and contact details of the DPO
- Likely consequences of the breach
- Measures taken or proposed to address the breach

**Authority**: Italian Data Protection Authority (Garante per la protezione dei dati personali)

- Website: https://www.garanteprivacy.it
- Breach notification portal: https://servizi.gpdp.it/databreach/s/

### Data Subjects (Article 34)

**Required when**: The breach is likely to result in a **high risk** to rights and freedoms.

**Not required when**:

- Data was encrypted/hashed and keys were not compromised
- Subsequent measures ensure the high risk is no longer likely
- It would involve disproportionate effort (use public communication instead)

**Notification must include**:

- Plain language description of what happened
- Name and contact details of the DPO
- Likely consequences
- Measures taken to address the breach
- Advice on what individuals can do to protect themselves

## Phase 4: Post-Incident (T+72h onwards)

1. **Root cause analysis**: Determine how the breach occurred
2. **Remediation**: Implement fixes to prevent recurrence
3. **Update security measures**: Enhance monitoring, access controls, or encryption
4. **Update breach register**: Complete the incident record
5. **Review and improve**: Update this procedure based on lessons learned

## Breach Register

All breaches, regardless of whether they require notification, must be recorded in a breach register with:

- Date and time of detection
- Nature of the breach
- Categories and approximate number of affected data subjects
- Categories and approximate number of affected personal data records
- Likely consequences
- Measures taken to address the breach
- Whether supervisory authority was notified
- Whether data subjects were communicated with

## Personal Data Processed by Affilibuster

| Data Category | Storage | Protection |
|--------------|---------|------------|
| Email addresses | PostgreSQL (encrypted at rest) | Bcrypt-hashed passwords |
| Display names | PostgreSQL | Access-controlled |
| IP addresses (consent) | PostgreSQL | Salted SHA-256 hash (non-reversible) |
| IP addresses (logs) | Container logs | Last octet anonymized |
| Session tokens | PostgreSQL | SHA-256 hashed |
| Consent records | PostgreSQL | Immutable audit trail |
| User preferences | PostgreSQL + Redis | Session-scoped |

## Contact

- **Data Protection Officer**: See privacy policy for contact details
- **System Administrator**: Internal contact list
