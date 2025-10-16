// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for RTLWrapper component
 */

import { render } from '@testing-library/react';
import { RTLWrapper } from '@/components/RTLWrapper';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

describe('RTLWrapper', () => {
  beforeEach(() => {
    // Reset document properties
    document.documentElement.dir = '';
    document.documentElement.lang = '';
    jest.clearAllMocks();
  });

  describe('LTR (English) paths', () => {
    it('should set ltr direction for root path', () => {
      usePathname.mockReturnValue('/');

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      );

      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should set ltr direction for /en path', () => {
      usePathname.mockReturnValue('/en/about');

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      );

      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should set ltr direction for /it path', () => {
      usePathname.mockReturnValue('/it/products');

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      );

      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });

    it('should render children with ltr wrapper', () => {
      usePathname.mockReturnValue('/en/about');

      const { container } = render(
        <RTLWrapper>
          <div data-testid="child">Test content</div>
        </RTLWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('dir')).toBe('ltr');
      expect(wrapper.className).toContain('ltr');
    });
  });

  describe('RTL (Hebrew) paths', () => {
    it('should set rtl direction for /he path', () => {
      usePathname.mockReturnValue('/he/about');

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      );

      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('he');
    });

    it('should set rtl direction for /il path', () => {
      usePathname.mockReturnValue('/he/products');

      render(
        <RTLWrapper>
          <div>Test content</div>
        </RTLWrapper>
      );

      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('he');
    });

    it('should render children with rtl wrapper', () => {
      usePathname.mockReturnValue('/he/about');

      const { container } = render(
        <RTLWrapper>
          <div data-testid="child">תוכן בדיקה</div>
        </RTLWrapper>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('dir')).toBe('rtl');
      expect(wrapper.className).toContain('rtl');
    });
  });

  describe('children rendering', () => {
    it('should render text children', () => {
      usePathname.mockReturnValue('/en');

      const { getByText } = render(
        <RTLWrapper>Hello World</RTLWrapper>
      );

      expect(getByText('Hello World')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      usePathname.mockReturnValue('/en');

      const { getByText } = render(
        <RTLWrapper>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </RTLWrapper>
      );

      expect(getByText('Child 1')).toBeInTheDocument();
      expect(getByText('Child 2')).toBeInTheDocument();
      expect(getByText('Child 3')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      usePathname.mockReturnValue('/he');

      const { getByTestId } = render(
        <RTLWrapper>
          <div data-testid="parent">
            <div data-testid="child">Nested content</div>
          </div>
        </RTLWrapper>
      );

      expect(getByTestId('parent')).toBeInTheDocument();
      expect(getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('direction switching', () => {
    it('should update direction when path changes from ltr to rtl', () => {
      usePathname.mockReturnValue('/en/about');

      const { rerender } = render(
        <RTLWrapper>
          <div>Content</div>
        </RTLWrapper>
      );

      expect(document.documentElement.dir).toBe('ltr');

      usePathname.mockReturnValue('/he/about');

      rerender(
        <RTLWrapper>
          <div>Content</div>
        </RTLWrapper>
      );

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should update direction when path changes from rtl to ltr', () => {
      usePathname.mockReturnValue('/he/products');

      const { rerender } = render(
        <RTLWrapper>
          <div>Content</div>
        </RTLWrapper>
      );

      expect(document.documentElement.dir).toBe('rtl');

      usePathname.mockReturnValue('/en/products');

      rerender(
        <RTLWrapper>
          <div>Content</div>
        </RTLWrapper>
      );

      expect(document.documentElement.dir).toBe('ltr');
    });
  });
});
