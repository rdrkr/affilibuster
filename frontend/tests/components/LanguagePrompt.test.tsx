// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Component Test for LanguagePrompt (T050)
 *
 * Tests the language detection and prompt component.
 * Reference: quickstart.md:105-121 (Non-intrusive prompt)
 * Reference: T111 (LanguagePrompt component implementation)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguagePrompt } from '@/components/LanguagePrompt';
import { languagesAPI, preferencesAPI } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useSession';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  languagesAPI: {
    detect: jest.fn(),
    getAll: jest.fn(),
  },
  preferencesAPI: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('@/hooks/useSession', () => ({
  useSession: jest.fn(),
}));

// Mock navigator.language
Object.defineProperty(window.navigator, 'language', {
  writable: true,
  value: 'it-IT',
});

describe('LanguagePrompt Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  const mockSessionId = 'test-session-123';

  const mockLanguages = [
    {
      code: 'en',
      displayName: 'English',
      nativeName: 'English',
      direction: 'ltr' as const,
      urlPrefix: '/en',
      defaultCurrency: 'USD',
      localeCode: 'en-US',
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      code: 'it',
      displayName: 'Italian',
      nativeName: 'Italiano',
      direction: 'ltr' as const,
      urlPrefix: '/it',
      defaultCurrency: 'EUR',
      localeCode: 'it-IT',
      isDefault: false,
      isActive: true,
      sortOrder: 2,
    },
  ];

  const mockPreferences = {
    id: '123',
    sessionId: mockSessionId,
    selectedCurrency: 'USD',
    dismissedLanguagePrompt: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    expiresAt: '2025-02-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue(mockSessionId);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/');
    (languagesAPI.getAll as jest.Mock).mockResolvedValue(mockLanguages);
    (preferencesAPI.get as jest.Mock).mockResolvedValue(mockPreferences);
    (preferencesAPI.update as jest.Mock).mockResolvedValue(mockPreferences);
  });

  it('should show prompt when Italian is detected for English page', async () => {
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    // Should show prompt
    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });
  });

  it('should NOT show prompt when already dismissed', async () => {
    (preferencesAPI.get as jest.Mock).mockResolvedValue({
      ...mockPreferences,
      dismissedLanguagePrompt: true,
    });

    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    // Should NOT show prompt
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument();
    });
  });

  it('should NOT show prompt when current language matches detected', async () => {
    (usePathname as jest.Mock).mockReturnValue('/it/products');
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    // Should NOT show prompt (already on Italian site)
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument();
    });
  });

  it('should display correct language name in prompt', async () => {
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
      expect(screen.getByText(/We detected you might prefer viewing this site in Italian/)).toBeInTheDocument();
    });
  });

  it('should navigate to detected language when "Yes" is clicked', async () => {
    (usePathname as jest.Mock).mockReturnValue('/products/test');
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });

    // Click "Yes" button
    const yesButton = screen.getByText(/Yes, switch to Italiano/);
    fireEvent.click(yesButton);

    // Should navigate to Italian version
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/it/products/test');
    });
  });

  it('should update preferences to dismissed when "Yes" is clicked', async () => {
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });

    // Click "Yes" button
    const yesButton = screen.getByText(/Yes, switch to Italiano/);
    fireEvent.click(yesButton);

    // Should update preferences
    await waitFor(() => {
      expect(preferencesAPI.update).toHaveBeenCalledWith({
        dismissedLanguagePrompt: true,
        detectedLanguage: 'it',
      });
    });
  });

  it('should dismiss prompt when "No thanks" is clicked', async () => {
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });

    // Click "No thanks" button
    const noButton = screen.getByText(/No thanks/);
    fireEvent.click(noButton);

    // Should update preferences to dismissed
    await waitFor(() => {
      expect(preferencesAPI.update).toHaveBeenCalledWith({
        dismissedLanguagePrompt: true,
      });
    });

    // Prompt should disappear
    await waitFor(() => {
      expect(screen.queryByText(/Switch to Italiano\?/)).not.toBeInTheDocument();
    });
  });

  it('should not navigate when "No thanks" is clicked', async () => {
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });

    // Click "No thanks" button
    const noButton = screen.getByText(/No thanks/);
    fireEvent.click(noButton);

    // Should NOT navigate
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (preferencesAPI.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<LanguagePrompt />);

    // Should not crash
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should handle detection API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (languagesAPI.detect as jest.Mock).mockRejectedValue(new Error('Detection failed'));

    render(<LanguagePrompt />);

    // Should not crash
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should not show prompt without session ID', async () => {
    (useSession as jest.Mock).mockReturnValue(null);

    render(<LanguagePrompt />);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not show prompt
    expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument();

    // Should not have called APIs
    expect(preferencesAPI.get).not.toHaveBeenCalled();
  });

  it('should not show prompt when shouldPrompt is false', async () => {
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'en',
      shouldPrompt: false, // English detected, no need to prompt
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    // Should not show prompt
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument();
    });
  });

  it('should show backdrop when prompt is visible', async () => {
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });

    // Should have backdrop
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    expect(backdrop).toBeInTheDocument();
  });

  it('should handle navigation from Italian to English path', async () => {
    (usePathname as jest.Mock).mockReturnValue('/it/prodotti/test');
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    // Change current path to English
    (usePathname as jest.Mock).mockReturnValue('/products/test');

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });

    // Click "Yes"
    const yesButton = screen.getByText(/Yes, switch to Italiano/);
    fireEvent.click(yesButton);

    // Should navigate to Italian
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  it('should handle homepage navigation', async () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });

    // Click "Yes"
    const yesButton = screen.getByText(/Yes, switch to Italiano/);
    fireEvent.click(yesButton);

    // Should navigate to Italian homepage
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/it/');
    });
  });

  it('should display icon in prompt', async () => {
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });

    // Should have language icon (SVG)
    const icon = document.querySelector('svg.text-blue-600');
    expect(icon).toBeInTheDocument();
  });

  it('should have proper button styling', async () => {
    (languagesAPI.detect as jest.Mock).mockResolvedValue({
      detectedLanguage: 'it',
      shouldPrompt: true,
      confidence: 0.95,
    });

    render(<LanguagePrompt />);

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument();
    });

    // Yes button should have primary styling
    const yesButton = screen.getByText(/Yes, switch to Italiano/);
    expect(yesButton).toHaveClass('bg-blue-600');

    // No button should have secondary styling
    const noButton = screen.getByText(/No thanks/);
    expect(noButton).toHaveClass('bg-gray-200');
  });
});
