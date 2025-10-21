# affilibuster Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-16

## Active Technologies

- Python 3.13 (003-comprehensive-testing-strategy)

## Project Structure

```
src/
tests/
```

## Commands

cd src [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES]
pytest [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] ruff check .

## Code Style

Python 3.13: Follow standard conventions

## Recent Changes

- 003-comprehensive-testing-strategy: Added Python 3.13

<!-- MANUAL ADDITIONS START -->

## OpenAPI Code Generation

Affilibuster uses a **layered OpenAPI architecture** for type-safe API definitions.

### Architecture

- **Layer 1 (Strapi)**: Content type schemas auto-generated from Strapi CMS
- **Layer 2 (Backend)**: API contract that references Strapi schemas via external `$ref`
- **Generated Code**: TypeScript types and Python Pydantic models auto-generated from specs

### Specifications

- **Backend API**: `contracts/template.openapi.yaml`
- **Strapi Content**: `contracts/strapi.openapi.yaml` (auto-generated)

### Important Notes

1. **Always run after spec changes**: Regenerate types whenever OpenAPI specs change
2. **Commit generated code**: Generated types are committed to version control
3. **External references**: Backend spec references Strapi schemas using `$ref: './strapi.openapi.yaml#/...'`
4. **Type safety**: Ensure frontend TypeScript and backend Python types match by using same source spec

### Documentation

See `docs/openapi-architecture.md` for detailed architecture, workflow, and best practices.

<!-- MANUAL ADDITIONS END -->

- never delete cms strapi database without permission
