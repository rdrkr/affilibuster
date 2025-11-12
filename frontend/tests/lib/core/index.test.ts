// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Tests for core module barrel exports
 *
 * These tests verify that the core module properly exports
 * all its public APIs through the index file.
 */

import * as CoreModule from '@/lib/core'

describe('Core Module Exports', () => {
  describe('API Types', () => {
    it('should export ApiError class', () => {
      expect(CoreModule.ApiError).toBeDefined()
      expect(typeof CoreModule.ApiError).toBe('function')
    })
  })

  describe('Client Functions', () => {
    it('should export apiRequest function', () => {
      expect(CoreModule.apiRequest).toBeDefined()
      expect(typeof CoreModule.apiRequest).toBe('function')
    })
  })

  describe('Storage Functions', () => {
    it('should export getCurrency function', () => {
      expect(CoreModule.getCurrency).toBeDefined()
      expect(typeof CoreModule.getCurrency).toBe('function')
    })

    it('should export setCurrency function', () => {
      expect(CoreModule.setCurrency).toBeDefined()
      expect(typeof CoreModule.setCurrency).toBe('function')
    })

    it('should export removeCurrency function', () => {
      expect(CoreModule.removeCurrency).toBeDefined()
      expect(typeof CoreModule.removeCurrency).toBe('function')
    })

    it('should export getLanguage function', () => {
      expect(CoreModule.getLanguage).toBeDefined()
      expect(typeof CoreModule.getLanguage).toBe('function')
    })

    it('should export setLanguage function', () => {
      expect(CoreModule.setLanguage).toBeDefined()
      expect(typeof CoreModule.setLanguage).toBe('function')
    })

    it('should export removeLanguage function', () => {
      expect(CoreModule.removeLanguage).toBeDefined()
      expect(typeof CoreModule.removeLanguage).toBe('function')
    })

    it('should export STORAGE_KEYS constant', () => {
      expect(CoreModule.STORAGE_KEYS).toBeDefined()
      expect(typeof CoreModule.STORAGE_KEYS).toBe('object')
    })
  })

  describe('Transformer Functions', () => {
    it('should export transformProductToContent function', () => {
      expect(CoreModule.transformProductToContent).toBeDefined()
      expect(typeof CoreModule.transformProductToContent).toBe('function')
    })
  })
})
