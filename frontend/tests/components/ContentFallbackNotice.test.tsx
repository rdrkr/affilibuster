// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for ContentFallbackNotice component
 */

import { render, screen } from '@testing-library/react';
import { ContentFallbackNotice } from '@/components/ContentFallbackNotice';

describe('ContentFallbackNotice', () => {
  describe('visibility', () => {
    it('should render when isVisible is true', () => {
      render(<ContentFallbackNotice isVisible={true} />);

      expect(
        screen.getByText(/Translation not available/i)
      ).toBeInTheDocument();
    });

    it('should not render when isVisible is false', () => {
      const { container } = render(<ContentFallbackNotice isVisible={false} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('default messages', () => {
    it('should show default language names', () => {
      render(<ContentFallbackNotice isVisible={true} />);

      expect(screen.getByText(/your language/i)).toBeInTheDocument();
      expect(screen.getByText(/English version/i)).toBeInTheDocument();
    });

    it('should show "Translation not available" header', () => {
      render(<ContentFallbackNotice isVisible={true} />);

      expect(screen.getByText('Translation not available.')).toBeInTheDocument();
    });
  });

  describe('custom language names', () => {
    it('should show custom requested language', () => {
      render(
        <ContentFallbackNotice
          isVisible={true}
          requestedLanguage="Italian"
        />
      );

      expect(screen.getByText(/Italian/i)).toBeInTheDocument();
    });

    it('should show custom fallback language', () => {
      render(
        <ContentFallbackNotice
          isVisible={true}
          fallbackLanguage="Hebrew"
        />
      );

      expect(screen.getByText(/Hebrew version/i)).toBeInTheDocument();
    });

    it('should show both custom languages', () => {
      render(
        <ContentFallbackNotice
          isVisible={true}
          requestedLanguage="Hebrew"
          fallbackLanguage="English"
        />
      );

      expect(screen.getByText(/Hebrew/i)).toBeInTheDocument();
      expect(screen.getByText(/English version/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have alert role', () => {
      render(<ContentFallbackNotice isVisible={true} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should contain warning icon', () => {
      const { container } = render(<ContentFallbackNotice isVisible={true} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-yellow-400');
    });
  });

  describe('styling', () => {
    it('should have yellow alert styling', () => {
      const { container } = render(<ContentFallbackNotice isVisible={true} />);

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('bg-yellow-50');
      expect(alert).toHaveClass('border-yellow-400');
    });

    it('should support dark mode styling', () => {
      const { container } = render(<ContentFallbackNotice isVisible={true} />);

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('dark:bg-yellow-900/20');
      expect(alert).toHaveClass('dark:border-yellow-600');
    });
  });

  describe('message variations', () => {
    it('should handle single-word language names', () => {
      render(
        <ContentFallbackNotice
          isVisible={true}
          requestedLanguage="French"
          fallbackLanguage="German"
        />
      );

      expect(screen.getByText(/French/i)).toBeInTheDocument();
      expect(screen.getByText(/German version/i)).toBeInTheDocument();
    });

    it('should handle multi-word language names', () => {
      render(
        <ContentFallbackNotice
          isVisible={true}
          requestedLanguage="Brazilian Portuguese"
          fallbackLanguage="American English"
        />
      );

      expect(screen.getByText(/Brazilian Portuguese/i)).toBeInTheDocument();
      expect(screen.getByText(/American English version/i)).toBeInTheDocument();
    });
  });
});
