// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Icon Resolution Utility
 */

import { resolveIcon } from '@/components/elements/CMSIcon'

describe('resolveIcon', () => {
  describe('local file icons', () => {
    it('should resolve SVG files to local icon path', () => {
      const result = resolveIcon('brand.svg')
      expect(result).toEqual({ type: 'local', value: '/icons/brand.svg' })
    })

    it('should resolve PNG files to local icon path', () => {
      const result = resolveIcon('logo.png')
      expect(result).toEqual({ type: 'local', value: '/icons/logo.png' })
    })

    it('should resolve WebP files to local icon path', () => {
      const result = resolveIcon('icon.webp')
      expect(result).toEqual({ type: 'local', value: '/icons/icon.webp' })
    })

    it('should be case-insensitive for file extensions', () => {
      const result = resolveIcon('BRAND.SVG')
      expect(result).toEqual({ type: 'local', value: '/icons/BRAND.SVG' })
    })
  })

  describe('material icons', () => {
    it('should convert "Title Case With Spaces" to snake_case', () => {
      const result = resolveIcon('Account Circle')
      expect(result).toEqual({ type: 'material', value: 'account_circle' })
    })

    it('should handle single word icons', () => {
      const result = resolveIcon('Home')
      expect(result).toEqual({ type: 'material', value: 'home' })
    })

    it('should handle already snake_cased icons', () => {
      const result = resolveIcon('account_circle')
      expect(result).toEqual({ type: 'material', value: 'account_circle' })
    })

    it('should handle PascalCase icons', () => {
      const result = resolveIcon('AccountCircle')
      expect(result).toEqual({ type: 'material', value: 'account_circle' })
    })

    it('should trim whitespace', () => {
      const result = resolveIcon('  account_circle  ')
      expect(result).toEqual({ type: 'material', value: 'account_circle' })
    })

    it('should collapse multiple spaces to single underscore', () => {
      const result = resolveIcon('View  List')
      expect(result).toEqual({ type: 'material', value: 'view_list' })
    })
  })

  describe('null/undefined handling', () => {
    it('should return null for empty string', () => {
      expect(resolveIcon('')).toBeNull()
    })

    it('should return null for null input', () => {
      expect(resolveIcon(null)).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(resolveIcon(undefined)).toBeNull()
    })

    it('should return null for whitespace-only string', () => {
      expect(resolveIcon('   ')).toBeNull()
    })
  })
})
