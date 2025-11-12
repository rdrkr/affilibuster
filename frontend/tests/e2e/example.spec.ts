// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { test, expect } from '../fixtures'
import { navigateAndWait } from '../helpers/waits'

test('homepage loads successfully', async ({ page }) => {
  await navigateAndWait(page, '/')
  await expect(page).toHaveTitle(/Affilibuster/)
})
