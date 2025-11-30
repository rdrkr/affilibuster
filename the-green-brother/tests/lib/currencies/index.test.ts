// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for lib/currencies barrel exports
 */

import * as currencies from '@/lib/currencies'

describe('lib/currencies barrel exports', () => {
  it('should export getCurrencies function', () => {
    expect(currencies.getCurrencies).toBeDefined()
    expect(typeof currencies.getCurrencies).toBe('function')
  })

  it('should export getCurrencyById function', () => {
    expect(currencies.getCurrencyById).toBeDefined()
    expect(typeof currencies.getCurrencyById).toBe('function')
  })
})
