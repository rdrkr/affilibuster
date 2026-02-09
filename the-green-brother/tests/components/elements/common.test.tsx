// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for button-common utilities
 */

import {
  type ButtonBaseClassesParams,
  type ComposeButtonContentParams,
  composeButtonContent,
  getButtonBaseClasses,
  getSizeDimensions,
  getSizeText,
  getVariantClasses,
  getVisibilityClasses,
} from '@/components/elements/common'
import { DirectionEnum } from '@/lib/generated/types.gen'

describe('common utilities', () => {
  describe('getVariantClasses', () => {
    it('should return classes for primary variant', () => {
      const classes = getVariantClasses('primary', false, false, DirectionEnum.LTR, false)
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-background-dark')
    })

    it('should handle active state', () => {
      const classes = getVariantClasses('ghost-1', true, false, DirectionEnum.LTR, false)
      expect(classes).toContain('text-primary text-shadow-sm dark:text-primary dark:text-shadow-none')
    })

    it('should handle noAnimation for link-1 variant', () => {
      const classesWithAnimation = getVariantClasses('link-1', false, false, DirectionEnum.LTR, false)
      const classesWithoutAnimation = getVariantClasses('link-1', false, true, DirectionEnum.LTR, false)
      expect(classesWithAnimation).toContain('hover:scale-105')
      expect(classesWithoutAnimation).not.toContain('hover:scale-105')
    })
  })

  describe('getSizeDimensions', () => {
    it('should return dimensions for all sizes', () => {
      expect(getSizeDimensions('sm')).toContain('py-1.5')
      expect(getSizeDimensions('md')).toContain('py-2')
      expect(getSizeDimensions('lg')).toContain('py-3')
      expect(getSizeDimensions('xl')).toContain('py-4')
      expect(getSizeDimensions('2xl')).toContain('py-5')
      expect(getSizeDimensions('3xl')).toContain('py-6')
    })
  })

  describe('getSizeText', () => {
    it('should return text sizes for all sizes', () => {
      expect(getSizeText('sm')).toBe('text-sm')
      expect(getSizeText('md')).toBe('text-base')
      expect(getSizeText('lg')).toBe('text-lg')
      expect(getSizeText('xl')).toBe('text-xl')
      expect(getSizeText('2xl')).toBe('text-2xl')
      expect(getSizeText('3xl')).toBe('text-3xl')
    })
  })

  describe('getVisibilityClasses', () => {
    it('should return visible classes when visible is true', () => {
      const classes = getVisibilityClasses(true)
      expect(classes).toContain('translate-x-0')
    })

    it('should return hidden classes when visible is false', () => {
      const classes = getVisibilityClasses(false)
      expect(classes).toContain('opacity-0')
      expect(classes).toContain('w-0')
      expect(classes).toContain('pointer-events-none')
    })

    it('should handle LTR end-to-start (default)', () => {
      const classes = getVisibilityClasses(false, DirectionEnum.LTR)
      expect(classes).toContain('-translate-x-4')
    })

    it('should handle RTL end-to-start', () => {
      const classes = getVisibilityClasses(false, DirectionEnum.RTL, 'end-to-start')
      expect(classes).toContain('translate-x-4')
    })

    it('should handle LTR start-to-end', () => {
      const classes = getVisibilityClasses(false, DirectionEnum.LTR, 'start-to-end')
      expect(classes).toContain('translate-x-4')
    })

    it('should handle RTL start-to-end', () => {
      const classes = getVisibilityClasses(false, DirectionEnum.RTL, 'start-to-end')
      expect(classes).toContain('-translate-x-4')
    })
  })
  describe('getButtonBaseClasses', () => {
    it('should return base classes', () => {
      const params: ButtonBaseClassesParams = {
        variant: 'primary',
        size: 'md',
        isActive: false,
        noAnimation: false,
        showText: true,
        direction: DirectionEnum.LTR,
        hasIcon: false,
        className: 'extra-class',
      }
      const classes = getButtonBaseClasses(params)
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('text-base')
      expect(classes).toContain('extra-class')
    })
  })

  describe('composeButtonContent', () => {
    it('should return null if no label and no children', () => {
      const params: ComposeButtonContentParams = {
        label: undefined,
        children: null,
        direction: DirectionEnum.LTR,
        iconSize: 'md',
      }
      const content = composeButtonContent(params)
      expect(content).toBeNull()
    })

    it('should return children if only children provided', () => {
      const params: ComposeButtonContentParams = {
        label: undefined,
        children: 'Child Content',
        direction: DirectionEnum.LTR,
        iconSize: 'md',
      }
      const content = composeButtonContent(params)
      expect(content).toBe('Child Content')
    })
  })
})
