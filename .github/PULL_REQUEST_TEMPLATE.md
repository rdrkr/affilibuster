<!-- Copyright (c) 2025 Affilibuster by Ronen Druker. -->

## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test coverage improvement

## Testing

### Test Coverage

- [ ] **Tests added/updated** for new/changed functionality
- [ ] **All tests passing** (`make test`)
- [ ] **Coverage requirements met** (80% backend/the-green-brother, 95% shared types, 60% CMS)

```bash
# Verify tests pass
make test

# Check coverage
make test-all
make coverage-view
```

### Test Details

<!-- Describe the tests added/updated -->

- Unit tests:
- Integration tests:
- Contract tests:
- E2E tests (if applicable):

## Checklist

### Code Quality

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex/non-obvious code
- [ ] No new warnings generated
- [ ] TypeScript types properly defined (no `any` without justification)

### Documentation

- [ ] Updated relevant documentation (README, component docs, etc.)
- [ ] Added/updated code comments where necessary
- [ ] Updated API documentation (if API changes)

### Backend Specific

- [ ] Database migrations created (if schema changes)
- [ ] New API endpoints documented
- [ ] Contract tests added for new endpoints
- [ ] Performance tested for new queries

### TheGreenBrother Specific

- [ ] Component tests added/updated
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] RTL support verified (if applicable)
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] i18n translations added (en, it, he)

### CMS Specific

- [ ] Only tested custom code (not Strapi boilerplate)

## Related Issues

<!-- Link related issues using: Closes #123, Fixes #456 -->

## Screenshots/Videos

<!-- Add screenshots or videos if applicable, especially for UI changes -->

## Additional Notes

<!-- Any additional information reviewers should know -->

---

**Deployment Notes:**

<!-- Any special deployment considerations, environment variables, etc. -->

**Rollback Plan:**

<!-- How to rollback if issues are discovered after deployment -->
