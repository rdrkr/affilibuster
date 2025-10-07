<!-- Copyright (c) 2025 Affilibuster by Ronen Druker. -->

# Shared - Common Types & Contracts

Shared TypeScript types and API contracts used across frontend and backend.

## Structure

```
types/          # TypeScript interfaces
└── contracts/  # OpenAPI specifications (source of truth)
```

## Usage

```typescript
// Frontend
import { Language, ContentResponse } from '@affilibuster/shared/types';

// Backend (via OpenAPI code generation)
// Types are generated from contracts/api-v1.yaml
```

## Types

- **Language**: Supported language configuration
- **Content**: Content entities and versions
- **Currency**: Currency formatting rules
- **UserPreferences**: User session preferences
- **SEO**: Meta tags and schema markup types
