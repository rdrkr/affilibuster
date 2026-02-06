<!-- Copyright (c) 2026 Affilibuster by Ronen Druker. -->

# Hetzner VPS Migration - Implementation Status

**Last Updated**: 2026-02-09

## Overview

Migration from Render.com (~$71/month) to a self-hosted Hetzner VPS (~$9.50/month).
Full plan: [plan.md](plan.md)

**Current Status**: VPS running at `91.99.166.44` with hardening and Docker installed.
Ready for DNS configuration and service deployment.

---

## Phase 2: Production Docker Configuration - COMPLETE

All production infrastructure files have been created and validated.

### Files Created

| File                                | Status | Description                                                                            |
| ----------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `docker-compose.prod.yaml`          | Done   | Caddy, resource limits, `expose` only, restart policies, log rotation                  |
| `Caddyfile`                         | Done   | Auto SSL, path-based API routing, security headers, compression                        |
| `cms/Dockerfile.prod`               | Done   | Multi-stage: builder (strapi build) -> runtime (node:22-alpine, non-root)              |
| `backend/Dockerfile.prod`           | Done   | Multi-stage: builder (uv sync --no-dev) -> runtime (python:3.13-slim, non-root)        |
| `backend/docker-entrypoint.prod.sh` | Done   | Wait for PG -> alembic migrate -> uvicorn (HTTP, 2 workers)                            |
| `the-green-brother/Dockerfile.prod` | Done   | 3-stage: deps -> builder (next build standalone) -> runtime (node server.js, non-root) |
| `.env.prod.example`                 | Done   | Hetzner-specific: Docker hostnames, Caddy URLs, secure cookies                         |
| `.github/workflows/deploy.yaml`     | Done   | CD: triggers after CI, SSH deploy, health checks, image prune                          |
| `scripts/backup-db.sh`              | Done   | Daily pg_dump via cron, 30-day retention, Hetzner Cloud Volume                         |

### Files Modified

| File                               | Change                                                |
| ---------------------------------- | ----------------------------------------------------- |
| `the-green-brother/next.config.ts` | Added `output: 'standalone'` for production Docker    |
| `.gitignore`                       | Added `.env.prod` ignore, allowed `.env.prod.example` |

### Key Architecture Decisions

1. **No code generation in Docker builds** - Generated OpenAPI types are committed to the repo
2. **CMS_PROTOCOL conflict resolved** - `https` globally, overridden to `http` for backend internal
3. **BACKEND_PROTOCOL=https** - Enables `Secure` cookie flag via Caddy SSL termination
4. **Non-root users** in all production containers (strapi:1001, backend:1001, nextjs:1001)
5. **CMS skips preflight** during build - runs `build:plugins && strapi build` directly

### Validation

- Pre-commit hooks: All pass
- Backend tests: 798 tests, 100% coverage
- Frontend tests: 1468 tests, all passing

---

## Phase 1: Hetzner VPS Setup - COMPLETE ✅

VPS provisioned and fully configured.

### Automation Files

| File                           | Status | Description                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `scripts/setup-vps.sh`         | Done   | Server hardening + Docker (run on fresh VPS) |
| `scripts/generate-env-prod.sh` | Done   | Interactive .env.prod generator              |
| `phase-1-guide.md`             | Done   | Step-by-step guide: Hetzner, secrets         |

### Completed Tasks

- [x] Created Hetzner server (CX33 Frankfurt) - IP: `91.99.166.44`
- [x] Ran `setup-vps.sh` on VPS (hardening complete)
- [x] Generated `.env.prod` with production secrets

## Phase 3: CI/CD Pipeline - PARTIAL

- [x] Deploy workflow created (`.github/workflows/deploy.yaml`)
- [ ] Add GitHub secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_SSH_KNOWN_HOSTS)

## Phase 4: DNS Migration - COMPLETE ✅

- [x] Update GoDaddy A records for `thegreenbrother.com`
- [x] Update GoDaddy A records for `cms.thegreenbrother.com`
- [x] Validated live services

## Phase 5: Data Migration - COMPLETE ✅

Services are running with production data.

## Phase 6: Backup Strategy - PARTIAL

- [x] Backup script created (`scripts/backup-db.sh`)
- [ ] Set up cron job on VPS
- [ ] Verify Cloud Volume mount at `/mnt/backups/`

## Phase 7: Monitoring - NOT STARTED

- [ ] Deploy Uptime Kuma container
- [ ] Configure health check endpoints
- [ ] Set up Telegram/Email alerts
