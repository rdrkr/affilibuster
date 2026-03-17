// Copyright (c) 2026 Affilibuster by Ronen Druker.

import * as SEOExports from '@/components/seo'

describe('SEO component exports', () => {
  it('should export JsonLdScript', () => {
    expect(SEOExports.JsonLdScript).toBeDefined()
    expect(typeof SEOExports.JsonLdScript).toBe('function')
  })
})
