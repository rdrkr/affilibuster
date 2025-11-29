// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Playwright test fixtures for E2E tests
 * Provides custom fixtures including API request interception for Docker networking
 */

import { test as base } from '@playwright/test'

/**
 * Extended test fixture that intercepts localhost API calls and routes them to Docker network
 * This allows Playwright tests running inside Docker to access the backend container
 */
export const test = base

export { expect } from '@playwright/test'
