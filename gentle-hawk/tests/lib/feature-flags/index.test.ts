// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { productSearchFlag, userProfileFlag } from '@/lib/feature-flags'

describe('Feature Flags', () => {
  it('productSearchFlag returns false by default', async () => {
    const result = await productSearchFlag()
    expect(result).toBe(false)
  })

  it('userProfileFlag returns false by default', async () => {
    const result = await userProfileFlag()
    expect(result).toBe(false)
  })
})
