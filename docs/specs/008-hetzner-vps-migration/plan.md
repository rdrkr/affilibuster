<!-- copyright (c) 2026 affilibuster by ronen druker. -->

# Migration Plan: Render.com to Hetzner VPS

## Context

Currently the app runs on Render.com (~$71/month: managed Postgres $7, Redis $7, Strapi CMS $25, Backend $7, Frontend $25). Migrating all services to a single Hetzner VPS reduces costs to ~$8.50/month (88% savings) while gaining more control over the infrastructure. The existing `docker-compose.yaml` already orchestrates all services -- we need production-optimized variants plus a reverse proxy for SSL and routing.

---

## Architecture Overview

```
Internet
  |
  v
Caddy (ports 80/443) -- automatic Let's Encrypt SSL
  |-- thegreenbrother.com      -> the-green-brother:3000 (Next.js)
  |-- thegreenbrother.com/api/* -> backend:8000 (FastAPI, path prefix stripped)
  +-- cms.thegreenbrother.com  -> strapi:1337 (Strapi CMS)

Internal Docker network (HTTP only):
  |-- postgres:5432
  |-- redis:6379
  |-- strapi:1337
  |-- backend:8000
  +-- the-green-brother:3000
```

Key change: **All inter-service communication is plain HTTP** inside Docker. Caddy terminates SSL at the edge. This eliminates the `strapi-proxy` (Nginx) service entirely and removes SSL cert handling from individual services.

---

## Phase 1: Hetzner VPS Setup

### 1.1 Server Selection

- **CX33**: 4 vCPU, 8GB RAM, 80GB NVMe, 20TB traffic (~6.59 EUR/mo, Frankfurt)
- Enable Hetzner automatic backups (+20% = ~1.32 EUR/mo)
- Attach a 20GB Cloud Volume for DB backups (~0.88 EUR/mo)
- **Total: ~8.79 EUR/mo (~$9.50)**

### 1.2 Server Hardening

- Create `deploy` user (no root SSH)
- SSH key auth only, disable password auth
- UFW firewall: allow 22, 80, 443 only
- Fail2ban for SSH brute-force protection
- Automatic security updates via `unattended-upgrades`
- 4GB swap as safety net

### 1.3 Install Docker

- Docker Engine + Docker Compose plugin
- Add `deploy` user to `docker` group

---

## Phase 2: Production Docker Configuration

### 2.1 New Files to Create

| File                                | Purpose                                                       |
| ----------------------------------- | ------------------------------------------------------------- |
| `docker-compose.prod.yaml`          | Production compose (Caddy, resource limits, no source mounts) |
| `Caddyfile`                         | Reverse proxy + auto SSL config                               |
| `cms/Dockerfile.prod`               | Multi-stage production Strapi build                           |
| `backend/Dockerfile.prod`           | Multi-stage production FastAPI build                          |
| `backend/docker-entrypoint.prod.sh` | Production entrypoint (no seed, no SSL flags)                 |
| `the-green-brother/Dockerfile.prod` | Multi-stage production Next.js build                          |
| `.env.prod.example`                 | Updated production env template                               |
| `.github/workflows/deploy.yaml`     | CD pipeline for VPS deployment                                |
| `scripts/backup-db.sh`              | Automated PostgreSQL backup script                            |

### 2.2 `docker-compose.prod.yaml`

Services: `caddy`, `postgres`, `redis`, `strapi`, `backend`, `the-green-brother`

Key differences from dev compose:

- **Caddy** replaces `strapi-proxy` -- handles SSL for all domains
- All app services use `expose` (not `ports`) -- only Caddy exposes 80/443
- `restart: unless-stopped` on all services
- `deploy.resources.limits` for memory caps
- No source code volume mounts -- code baked into images
- No `test-runner` service
- Docker log rotation (`json-file`, 10MB max, 3 files)
- Production health checks with tuned intervals

### 2.3 `Caddyfile`

```
thegreenbrother.com, www.thegreenbrother.com {
    handle_path /api/* {
        reverse_proxy backend:{$BACKEND_PORT}
    }
    reverse_proxy the-green-brother:{$THE_GREEN_BROTHER_PORT}
    header { security headers... }
    encode zstd gzip
}

cms.thegreenbrother.com {
    reverse_proxy strapi:{$CMS_PORT}
    header { security headers... }
    encode zstd gzip
}
```

Caddy auto-provisions and renews Let's Encrypt certs -- zero certificate management.

### 2.4 Production Dockerfiles

Each service gets a multi-stage `Dockerfile.prod`:

**CMS** (`cms/Dockerfile.prod`): `node:22-alpine` builder -> `npm ci && strapi build` -> runtime with `npm run start`

**Backend** (`backend/Dockerfile.prod`): `python:3.13-slim` builder -> `uv sync --frozen --no-dev` -> runtime with production entrypoint (alembic migrate + uvicorn, no SSL flags)

**Frontend** (`the-green-brother/Dockerfile.prod`): `node:22-slim` deps -> builder (`next build` standalone) -> runtime with `node server.js`

### 2.5 Production Environment (`.env.prod`)

Critical changes from current Render config:

- `BACKEND_PROTOCOL=https` (enables Secure cookie flag; Caddy handles actual SSL)
- `CMS_PROTOCOL=https` for public-facing URLs (overridden to `http` for backend internal communication)
- `POSTGRES_HOST=postgres`, `REDIS_HOST=redis`, `CMS_HOST=strapi` (Docker hostnames)
- `POSTGRES_SSL=false` (internal Docker, no TLS needed)
- `NEXT_PUBLIC_API_URL=https://thegreenbrother.com/api/v1` (browser calls via Caddy path routing)
- `NEXT_SERVER_SIDE_API_URL=http://backend:8000/v1` (SSR via Docker network)
- `NEXT_PUBLIC_CMS_URL=https://cms.thegreenbrother.com`
- Security keys **must match** current Render values (extract before migration)
- Cloudinary credentials unchanged (external service)

### 2.6 API Routing Change

Currently on Render, the backend is a private service (`pserv`). On Hetzner, Caddy routes `thegreenbrother.com/api/*` to the backend. `handle_path /api/*` strips the `/api` prefix, so `/api/v1/health` becomes `/v1/health` at the backend -- matching its `root_path="/v1"`.

This makes both SSR and client-side API calls work via the same public domain (no CORS needed).

Reference: `the-green-brother/src/lib/core/client.ts` - `getBaseUrl()` uses `NEXT_PUBLIC_API_URL` client-side and `NEXT_SERVER_SIDE_API_URL` server-side.

---

## Phase 3: CI/CD Pipeline

### 3.1 Existing CI (no changes)

`.github/workflows/ci.yaml` stays as-is -- runs tests on push to `main`.

### 3.2 New Deploy Workflow

`.github/workflows/deploy.yaml` triggers after CI succeeds:

1. SSH into VPS as `deploy` user
2. `git pull origin main`
3. `docker compose -f docker-compose.prod.yaml build --parallel`
4. `docker compose -f docker-compose.prod.yaml up -d --remove-orphans`
5. Health check all endpoints
6. `docker image prune -af --filter "until=24h"`

Uses `appleboy/ssh-action@v1`. Near-zero downtime (Docker recreates containers sequentially, old ones serve until new ones pass health checks).

### 3.3 GitHub Secrets to Add

- `VPS_HOST` - Hetzner server IP
- `VPS_USER` - `deploy`
- `VPS_SSH_KEY` - SSH private key
- `VPS_SSH_KNOWN_HOSTS` - from `ssh-keyscan`

---

## Phase 4: DNS Migration (GoDaddy)

1. **Pre-migration**: Reduce TTL on all records to 300s, wait for old TTL to expire
2. **Cutover**: Update A records:
   - `@` -> `<hetzner-ipv4>`
   - `www` -> `<hetzner-ipv4>`
   - `cms` -> `<hetzner-ipv4>`
3. **Post-migration**: After 72h stable, increase TTL to 3600

---

## Phase 5: Data Migration

### 5.1 PostgreSQL (shared by Strapi + Backend)

1. `pg_dump -Fc` from Render managed Postgres
2. Transfer dump to VPS via `scp`
3. Start only Postgres on VPS, restore with `pg_restore`

### 5.2 Redis

No migration needed -- ephemeral cache, auto-regenerates.

### 5.3 Cloudinary Media

No migration needed -- same API credentials work from any server.

### 5.4 Strapi API Token

Already in the `api_config` table -- restored with the Postgres dump. Backend reads it at startup.

### 5.5 Migration Order

1. Export DB from Render -> transfer to VPS
2. Start Postgres on VPS, restore dump
3. Start Redis
4. Start Strapi (connects to restored DB)
5. Verify CMS admin panel
6. Start Backend (reads API token from DB)
7. Start Frontend
8. Start Caddy
9. Update DNS

---

## Phase 6: Backup Strategy

- **Automated daily DB backups**: `scripts/backup-db.sh` via cron at 3 AM UTC -> `/mnt/backups/` (Hetzner Cloud Volume)
- **30-day retention** with automatic cleanup
- **Hetzner server snapshots**: Built-in, covers entire server state
- Optional: `rclone sync` to Hetzner Object Storage for off-server disaster recovery

---

## Phase 7: Monitoring

- **Uptime Kuma** (self-hosted, Docker): Monitor all health endpoints + SSL expiry
- Endpoints: `thegreenbrother.com`, `/api/v1/health`, `cms.thegreenbrother.com/api/health`
- Alerts via Telegram/Email
- Docker log rotation on all services

---

## Rollback Plan

1. **Keep Render services running** for 72+ hours after DNS cutover
2. If issues arise: change DNS A records back to Render CNAME values (5-10 min propagation at 300s TTL)
3. For deployment failures: `git checkout <previous-sha> && docker compose up -d --build`
4. For DB issues: restore from latest backup in `/mnt/backups/`

---

## Execution Checklist

### Days 1-2: Preparation

- [ ] Create Hetzner server (CX33 Frankfurt) + backup volume
- [ ] Server hardening (SSH, UFW, fail2ban, Docker)
- [ ] Extract all secrets from Render dashboard
- [ ] Create all production Dockerfiles, Caddyfile, docker-compose.prod.yaml
- [ ] Create deploy.yaml GitHub Action
- [ ] Add GitHub secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_SSH_KNOWN_HOSTS)

### Days 3-5: Build & Test on Hetzner

- [ ] Clone repo, create `.env.prod` on server
- [ ] Build all Docker images
- [ ] Export DB from Render, restore on VPS
- [ ] Start all services, verify health endpoints
- [ ] Test CMS admin, frontend pages, API responses
- [ ] Set up backup cron + Uptime Kuma

### Day 6: DNS Cutover

- [ ] Reduce DNS TTL to 300s (if not already done)
- [ ] Final DB sync from Render
- [ ] Update DNS A records to Hetzner IP
- [ ] Verify SSL auto-provisioning
- [ ] Test all domains end-to-end

### Days 7-9: Validation

- [ ] Monitor logs and health checks
- [ ] Test CI/CD pipeline (push to main -> auto-deploy)
- [ ] Verify Lighthouse scores, i18n, RTL

### Day 10+: Cleanup

- [ ] Increase DNS TTL to 3600
- [ ] Shut down Render services (after 72h stable)
- [ ] Cancel Render plan

---

## Verification

After implementation:

1. `curl -sf https://thegreenbrother.com` -> 200 (frontend loads)
2. `curl -sf https://thegreenbrother.com/api/v1/health` -> `{"status":"healthy"}`
3. `curl -sf https://cms.thegreenbrother.com/api/health` -> `{"status":"ready","ready":true}`
4. SSL certificate valid for all domains (check with `curl -vI`)
5. Push to `main` triggers CI -> CD -> auto-deploy to VPS
6. Lighthouse scores >90
7. All 3 languages work (en, it, he with RTL)
