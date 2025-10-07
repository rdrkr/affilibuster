// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Affilibuster/)
})
