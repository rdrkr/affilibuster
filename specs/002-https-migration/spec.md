# Feature Specification: HTTPS Migration

**Spec ID**: 002
**Feature**: HTTPS Migration for All Components
**Status**: In Progress
**Priority**: High
**Created**: 2025-11-24
**Last Updated**: 2025-11-24

## Overview

Migrate the entire Affilibuster application stack (CMS, backend, frontend) from HTTP to HTTPS-only for local development and production environments. This ensures secure cookie transmission, prepares for production deployment, and aligns with modern web security best practices.

## Business Context

### Problem Statement

Currently, the application runs on HTTP in development, which:
- Prevents secure cookie flags from working (`secure=False` is explicitly set)
- Creates a mismatch between development and production environments
- Blocks testing of security-critical features (cookie security, CORS policies, mixed content)
- Does not reflect real-world production conditions

### Success Criteria

1. All services (frontend, backend, CMS) accessible via HTTPS on localhost
2. Secure cookies working correctly with `secure=true`
3. No browser security warnings or mixed content errors
4. Zero code changes needed for production HTTPS deployment
5. All existing tests passing with HTTPS configuration
6. Developer onboarding documentation updated

### Business Value

- **Security**: Enforces secure cookie transmission and prevents MITM attacks even in development
- **Production Parity**: Development environment mirrors production security posture
- **Testing**: Enables testing of security features that require HTTPS
- **Compliance**: Aligns with security best practices and compliance requirements

## Technical Requirements

### Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-001 | Generate trusted SSL certificates for localhost using mkcert | Must Have | Certificates generated and trusted by system |
| FR-002 | Frontend accessible via https://localhost:3000 | Must Have | Browser shows secure connection, no warnings |
| FR-003 | Backend API accessible via https://localhost:8000 | Must Have | API docs at https://localhost:8000/docs work |
| FR-004 | CMS accessible via https://localhost:1337 | Must Have | Admin panel loads without errors |
| FR-005 | Cookies set with `secure=true` flag | Must Have | Inspecting cookies shows secure flag enabled |
| FR-006 | Environment variables support both HTTP and HTTPS | Must Have | Protocol configurable via env vars |
| FR-007 | Docker Compose mounts certificates into containers | Must Have | Containers have access to SSL certificates |
| FR-008 | Health checks use HTTPS protocol | Must Have | Docker healthchecks pass with HTTPS |
| FR-009 | All cross-service communication uses HTTPS | Must Have | No mixed content warnings |
| FR-010 | Documentation updated with HTTPS setup instructions | Must Have | New developers can set up HTTPS following docs |

### Non-Functional Requirements

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-001 | No performance degradation | <5% overhead | Page load time comparison |
| NFR-002 | Zero downtime during migration | N/A | All services start successfully |
| NFR-003 | Backward compatibility with existing .env files | N/A | Old .env files work with protocol override |
| NFR-004 | Certificate renewal process documented | N/A | Clear renewal instructions in docs |

### Technical Constraints

- Must use `mkcert` for certificate generation (not self-signed certificates)
- Must support macOS, Linux, and Windows (WSL2)
- Must not commit certificates to version control
- Must maintain existing API contracts and response formats
- Must work with Docker Compose orchestration

## Architecture

### System Components Affected

1. **Frontend (Next.js)**
   - Custom HTTPS server required for development
   - Environment variable updates
   - Image optimization proxy configuration

2. **Backend (FastAPI)**
   - Uvicorn SSL configuration
   - Cookie security flag updates
   - Settings configuration for protocol detection

3. **CMS (Strapi)**
   - Server SSL configuration
   - Protocol environment variable

4. **Infrastructure**
   - Docker Compose volume mounts
   - Health check protocol updates
   - Certificate management

### Data Flow

```
Browser (HTTPS) → Frontend:3000 (HTTPS) → Backend:8000 (HTTPS) → Strapi:1337 (HTTPS) → PostgreSQL:5432
                                        ↓
                                   Redis:6379
```

### Security Considerations

- **Certificate Storage**: Certificates stored in `/certs` (gitignored)
- **Cookie Security**: All cookies set with `secure=true`, `httponly=true`, `samesite=lax`
- **Mixed Content**: All internal URLs use HTTPS protocol
- **CORS**: Updated to allow HTTPS origins only
- **Certificate Trust**: mkcert adds root CA to system trust store

### Performance Impact

- **Minimal**: HTTPS overhead typically <5% for localhost connections
- **No changes to caching strategy**: Redis caching remains unchanged
- **No database impact**: PostgreSQL connection unaffected

## Implementation Plan

### Phase 1: Certificate Generation & Infrastructure Setup

**Tasks**:

1. **T001**: Install mkcert (document for macOS, Linux, Windows)
2. **T002**: Generate SSL certificates for localhost
   - Run: `mkcert -install`
   - Run: `mkcert localhost 127.0.0.1 ::1`
3. **T003**: Create `/certs` directory in project root
4. **T004**: Add `/certs/*` to `.gitignore` (exclude `.gitkeep`)
5. **T005**: Create `/certs/.gitkeep` to track directory
6. **T006**: Move generated certificates to `/certs` directory

### Phase 2: Environment Configuration

**Tasks**:

7. **T007**: Update `.env.dev.example` with HTTPS protocol variables
   - `FRONTEND_PROTOCOL=https`
   - `BACKEND_PROTOCOL=https`
   - `CMS_PROTOCOL=https`
8. **T008**: Update local `.env` file with HTTPS protocols
9. **T009**: Add certificate path variables to `.env.dev.example`
   - `SSL_CERT_PATH=/certs/localhost.pem`
   - `SSL_KEY_PATH=/certs/localhost-key.pem`

### Phase 3: Docker Compose Configuration

**Tasks**:

10. **T010**: Add certificate volume mounts to `docker-compose.yaml`
    - Mount `/certs` to frontend container
    - Mount `/certs` to backend container
    - Mount `/certs` to CMS container
11. **T011**: Update frontend healthcheck to use HTTPS with `-k` flag
12. **T012**: Update backend healthcheck to use HTTPS with `-k` flag
13. **T013**: Update CMS healthcheck to use HTTPS with `-k` flag

### Phase 4: Backend (FastAPI) Configuration

**Tasks**:

14. **T014**: Update `backend/src/affilibuster_backend/config/settings.py`
    - Add `should_use_secure_cookies` property based on `backend_protocol`
15. **T015**: Update `backend/src/affilibuster_backend/infrastructure/api/routes/auth.py`
    - Replace hardcoded `secure=False` with dynamic value from settings (line 327)
    - Replace hardcoded `secure=False` with dynamic value from settings (line 482)
16. **T016**: Update `backend/Dockerfile` to accept SSL environment variables
17. **T017**: Update backend startup command in `docker-compose.yaml`
    - Add `--ssl-keyfile` and `--ssl-certfile` flags to uvicorn

### Phase 5: Frontend (Next.js) Configuration

**Tasks**:

18. **T018**: Create `frontend/server.ts` custom HTTPS server
    - Import `https` module
    - Load SSL certificates
    - Create HTTPS server with Next.js request handler
19. **T019**: Update `frontend/package.json` dev script
    - Change from `next dev` to `tsx server.ts`
20. **T020**: Add `tsx` dev dependency to frontend
    - Run: `npm install --save-dev tsx`
21. **T021**: Update `frontend/next.config.ts` if needed
    - Verify image optimization uses HTTPS protocol from env

### Phase 6: CMS (Strapi) Configuration

**Tasks**:

22. **T022**: Update `cms/config/server.ts`
    - Add SSL configuration object when protocol is HTTPS
    - Reference certificate paths from environment variables
23. **T023**: Update Strapi startup in `docker-compose.yaml` if needed
    - Ensure environment variables passed correctly

### Phase 7: Testing & Validation

**Tasks**:

24. **T024**: Test backend API with HTTPS
    - Access https://localhost:8000/docs
    - Verify no certificate warnings
    - Test health endpoint
25. **T025**: Test frontend with HTTPS
    - Access https://localhost:3000
    - Verify no mixed content warnings
    - Test navigation and API calls
26. **T026**: Test CMS with HTTPS
    - Access https://localhost:1337/admin
    - Verify admin login works
    - Test content creation
27. **T027**: Verify secure cookies in browser DevTools
    - Inspect cookies after login
    - Confirm `secure` flag is true
28. **T028**: Run backend test suite
    - `make test-backend` should pass
29. **T029**: Run frontend test suite
    - `make test-frontend` should pass
30. **T030**: Run E2E tests with Playwright
    - Update Playwright config if needed for self-signed certs
    - All auth flows should pass

### Phase 8: Documentation

**Tasks**:

31. **T031**: Update `README.md` with HTTPS setup instructions
    - Add mkcert installation to prerequisites
    - Document certificate generation steps
    - Update service URLs to HTTPS
32. **T032**: Update `CLAUDE.md` with HTTPS configuration
    - Add to "Environment Configuration" section
    - Document certificate paths
    - Add troubleshooting section
33. **T033**: Create `docs/HTTPS_SETUP.md` detailed guide
    - Step-by-step mkcert setup for each OS
    - Certificate renewal instructions
    - Troubleshooting common issues
34. **T034**: Update `.env.dev.example` comments
    - Clarify protocol options (http/https)
    - Note certificate requirements for HTTPS

## Testing Strategy

### Unit Tests

- **Backend**: Cookie security flag logic in `settings.py`
- **Backend**: Auth routes cookie setting with dynamic secure flag
- No frontend unit test changes required

### Integration Tests

- **Cross-service communication**: Frontend → Backend → CMS over HTTPS
- **Cookie transmission**: Verify cookies sent/received correctly
- **CORS**: Verify HTTPS origins allowed

### E2E Tests

- **Auth flow**: Login, register, logout with HTTPS
- **Session persistence**: Cookies persist across page loads
- **API calls**: All API interactions work over HTTPS

### Manual Testing Checklist

- [ ] Frontend loads without warnings at https://localhost:3000
- [ ] Backend API docs accessible at https://localhost:8000/docs
- [ ] CMS admin panel accessible at https://localhost:1337/admin
- [ ] Login flow works end-to-end
- [ ] Cookies show `secure=true` in DevTools
- [ ] No mixed content warnings in browser console
- [ ] All navigation and interactions work normally
- [ ] Health checks pass in Docker Compose

## Rollout Plan

### Rollout Phases

1. **Development Environment** (Immediate)
   - Update local development setup to HTTPS
   - Test with development team

2. **CI/CD Pipeline** (After local validation)
   - Update GitHub Actions to install mkcert
   - Generate certificates in CI environment
   - Run tests with HTTPS configuration

3. **Staging Environment** (After CI/CD)
   - Deploy HTTPS configuration to staging
   - Run full regression test suite

4. **Production Environment** (Final)
   - Use production SSL certificates (Let's Encrypt, etc.)
   - Update environment variables to production URLs
   - Zero code changes needed (already HTTPS-ready)

### Rollback Plan

If issues arise:

1. Revert environment variables to HTTP protocol
2. Remove SSL flags from Docker Compose
3. Use HTTP URLs for local development
4. Investigate and fix issues before re-attempting

**Note**: Code changes are minimal and non-breaking, making rollback straightforward.

## Dependencies

### External Dependencies

- **mkcert**: Certificate generation tool
  - macOS: `brew install mkcert`
  - Linux: `apt-get install mkcert` or build from source
  - Windows: `choco install mkcert` or download binary

### Internal Dependencies

- None (independent feature)

### Blocking Issues

- None identified

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Certificate trust issues on some systems | Medium | High | Document mkcert troubleshooting, provide alternative self-signed cert instructions |
| Performance degradation | Low | Medium | Benchmark before/after, optimize if needed |
| E2E tests fail with HTTPS | Medium | High | Update Playwright config to accept self-signed certs |
| Cross-platform certificate issues | Medium | Medium | Test on macOS, Linux, Windows; document OS-specific steps |
| Developer onboarding friction | Medium | Low | Clear documentation, automated setup script |

## Metrics & Monitoring

### Success Metrics

- **Migration Success Rate**: 100% of services running on HTTPS
- **Test Pass Rate**: 100% of tests passing with HTTPS
- **Developer Setup Time**: <10 minutes to configure HTTPS
- **Performance Impact**: <5% overhead vs HTTP

### Monitoring

- Monitor browser console for mixed content warnings
- Track Docker health check success rates
- Monitor application performance metrics (no degradation)

## Open Questions

- [ ] Should we provide a setup script to automate mkcert installation and certificate generation?
- [ ] Do we need different certificates for different environments (dev, staging)?
- [ ] Should we add certificate expiration monitoring?

## References

### Related Documents

- Constitution: Security & Compliance principles
- ROADMAP.md: Section 11 (Security & Compliance)
- Spec 004: User Authentication (depends on secure cookies)

### External Resources

- [mkcert GitHub](https://github.com/FiloSottile/mkcert)
- [Next.js Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
- [FastAPI HTTPS](https://fastapi.tiangolo.com/deployment/https/)
- [Strapi Server Configuration](https://docs.strapi.io/dev-docs/configurations/server)

## Appendix

### File Changes Summary

**New Files**:
- `certs/.gitkeep`
- `certs/localhost.pem` (gitignored)
- `certs/localhost-key.pem` (gitignored)
- `frontend/server.ts`
- `docs/HTTPS_SETUP.md`

**Modified Files**:
- `.env`
- `.env.dev.example`
- `.gitignore`
- `docker-compose.yaml`
- `backend/src/affilibuster_backend/config/settings.py`
- `backend/src/affilibuster_backend/infrastructure/api/routes/auth.py`
- `frontend/package.json`
- `cms/config/server.ts`
- `README.md`
- `CLAUDE.md`
- `ROADMAP.md`

### Task Summary

- **Total Tasks**: 34
- **Phase 1**: 6 tasks (Certificate Generation)
- **Phase 2**: 3 tasks (Environment Configuration)
- **Phase 3**: 4 tasks (Docker Compose)
- **Phase 4**: 4 tasks (Backend)
- **Phase 5**: 4 tasks (Frontend)
- **Phase 6**: 2 tasks (CMS)
- **Phase 7**: 7 tasks (Testing)
- **Phase 8**: 4 tasks (Documentation)
