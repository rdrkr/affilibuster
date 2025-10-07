<!-- Copyright (c) 2025 Affilibuster by Ronen Druker. -->

# Frontend - Next.js 14

Multi-language affiliate platform frontend.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS (with RTL support)
- **i18n**: next-intl
- **Testing**: Jest, React Testing Library, Playwright

## Structure

```
src/
├── app/             # Next.js App Router pages
│   └── [lang]/      # Language-specific routes
├── components/      # React components
├── lib/            # Utilities and API clients
└── types/          # TypeScript types

tests/
├── components/     # Component tests
├── integration/    # E2E tests (Playwright)
└── unit/          # Utility tests
```

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your API URL if needed

# Start dev server
npm run dev

# Access frontend
open http://localhost:3000
```

## Routes

- Root: http://localhost:3000 (English, default)
- Italian: http://localhost:3000/it
- Hebrew: http://localhost:3000/il (RTL layout)

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# View coverage report
open coverage/lcov-report/index.html
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npx playwright test --headed

# Run E2E tests with UI
npx playwright test --ui

# List all available tests
npx playwright test --list
```

## Building for Production

```bash
# Build for production
npm run build

# Start production server
npm start

# Preview production build locally
npm run build && npm start
```

## Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix

# Run TypeScript type check
npm run type-check
```
