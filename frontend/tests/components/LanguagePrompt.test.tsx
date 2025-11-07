// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Component Test for LanguagePrompt (T050)
 *
 * Tests the language detection and prompt component.
 * Reference: quickstart.md:105-121 (Non-intrusive prompt)
 * Reference: T111 (LanguagePrompt component implementation)
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LanguagePrompt } from '@/components/LanguagePrompt'
import * as client from '@/lib/client'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from '@/hooks/useSession'
import { CodeEnum } from '@/lib/generated/types.gen'
import { CurrencyCode } from '@/lib/types'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('@/lib/client', () => ({
  detectLanguage: jest.fn(),
  getLanguages: jest.fn(),
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
  getNavigation: jest.fn(),
}))

jest.mock('@/hooks/useSession', () => ({
  useSession: jest.fn(),
}))

// Mock navigator.language
Object.defineProperty(window.navigator, 'language', {
  writable: true,
  value: 'it-IT',
})

describe('LanguagePrompt Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  const mockSessionId = 'test-session-123'

  const mockLanguages = [
    {
      code: CodeEnum.EN,
      displayName: 'English',
      nativeName: 'English',
      direction: 'ltr' as const,
      urlPrefix: '/en',
      defaultCurrency: CurrencyCode.USD,
      localeCode: 'en-US',
      isDefault: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      code: CodeEnum.IT,
      displayName: 'Italian',
      nativeName: 'Italiano',
      direction: 'ltr' as const,
      urlPrefix: '/it',
      defaultCurrency: CurrencyCode.EUR,
      localeCode: 'it-IT',
      isDefault: false,
      isActive: true,
      sortOrder: 2,
    },
  ]

  const mockPreferences = {
    id: '123',
    sessionId: mockSessionId,
    selectedCurrency: CurrencyCode.USD,
    dismissedLanguagePrompt: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    expiresAt: '2025-02-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue(mockSessionId)
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockReturnValue('/')
    ;(client.getLanguages as jest.Mock).mockResolvedValue(mockLanguages)
    ;(client.getUserPreferences as jest.Mock).mockResolvedValue(mockPreferences)
    ;(client.updateUserPreferences as jest.Mock).mockResolvedValue(mockPreferences)
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({ code: CodeEnum.EN, confidence: 1.0 })
    ;(client.getNavigation as jest.Mock).mockResolvedValue({
      promptTitleTemplate: 'Switch to {language}?',
      promptMessageTemplate: 'We detected you might prefer viewing this site in {language}',
      yesButtonTemplate: 'Yes, switch to {language}',
      noButtonText: 'No thanks',
    })
  })

  it('should show prompt when Italian is detected for English page', async () => {
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    // Should show prompt
    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })
  })

  it('should NOT show prompt when already dismissed', async () => {
    ;(client.getUserPreferences as jest.Mock).mockResolvedValue({
      ...mockPreferences,
      dismissedLanguagePrompt: true,
    })
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    // Should NOT show prompt
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })
  })

  it('should NOT show prompt when current language matches detected', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/it/products')
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    // Should NOT show prompt (already on Italian site)
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })
  })

  it('should display correct language name in prompt', async () => {
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
      expect(screen.getByText(/We detected you might prefer viewing this site in Italian/)).toBeInTheDocument()
    })
  })

  it('should navigate to detected language when "Yes" is clicked', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/products/test')
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Click "Yes" button
    const yesButton = screen.getByText(/Yes, switch to Italiano/)
    fireEvent.click(yesButton)

    // Should navigate to Italian version
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/it/products/test')
    })
  })

  it('should update preferences to dismissed when "Yes" is clicked', async () => {
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Click "Yes" button
    const yesButton = screen.getByText(/Yes, switch to Italiano/)
    fireEvent.click(yesButton)

    // Should update preferences
    await waitFor(() => {
      expect(client.updateUserPreferences).toHaveBeenCalledWith({
        dismissedLanguagePrompt: true,
        detectedLanguage: CodeEnum.IT,
      })
    })
  })

  it('should dismiss prompt when "No thanks" is clicked', async () => {
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Click "No, thanks" button
    const noButton = screen.getByText(/No thanks/)
    fireEvent.click(noButton)

    // Should update preferences to dismissed
    await waitFor(() => {
      expect(client.updateUserPreferences).toHaveBeenCalledWith({
        dismissedLanguagePrompt: true,
      })
    })

    // Prompt should disappear
    await waitFor(() => {
      expect(screen.queryByText(/Switch to Italiano\?/)).not.toBeInTheDocument()
    })
  })

  it('should not navigate when "No thanks" is clicked', async () => {
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Click "No, thanks" button
    const noButton = screen.getByText(/No thanks/)
    fireEvent.click(noButton)

    // Should NOT navigate
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.getUserPreferences as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<LanguagePrompt />)

    // Should not crash
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('should handle detection API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.detectLanguage as jest.Mock).mockRejectedValue(new Error('Detection failed'))

    render(<LanguagePrompt />)

    // Should not crash
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('should not show prompt without session ID', async () => {
    ;(useSession as jest.Mock).mockReturnValue(null)

    render(<LanguagePrompt />)

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should not show prompt
    expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()

    // Should not have called APIs
    expect(client.getUserPreferences).not.toHaveBeenCalled()
  })

  it('should not show prompt when shouldPrompt is false', async () => {
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.EN,
      shouldPrompt: false, // English detected, no need to prompt
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    // Should not show prompt
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })
  })

  it('should show backdrop when prompt is visible', async () => {
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Should have backdrop
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
    expect(backdrop).toBeInTheDocument()
  })

  it('should handle navigation from Italian to English path', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/it/prodotti/test')
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    // Change current path to English
    ;(usePathname as jest.Mock).mockReturnValue('/products/test')

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Click "Yes"
    const yesButton = screen.getByText(/Yes, switch to Italiano/)
    fireEvent.click(yesButton)

    // Should navigate to Italian
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalled()
    })
  })

  it('should handle homepage navigation', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Click "Yes"
    const yesButton = screen.getByText(/Yes, switch to Italiano/)
    fireEvent.click(yesButton)

    // Should navigate to Italian homepage
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/it/')
    })
  })

  it('should display icon in prompt', async () => {
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Should have language icon (SVG)
    const icon = document.querySelector('svg.text-secondary-600')
    expect(icon).toBeInTheDocument()
  })

  it('should have proper button styling', async () => {
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Yes button should have primary styling
    const yesButton = screen.getByText(/Yes, switch to Italiano/)
    expect(yesButton).toHaveClass('bg-secondary-600')

    // No button should have secondary styling
    const noButton = screen.getByText(/No thanks/)
    expect(noButton).toHaveClass('bg-neutral-200')
  })

  it('should handle getNavigation error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.getNavigation as jest.Mock).mockRejectedValue(new Error('Navigation failed'))
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    // Should not crash
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should not show prompt when navigation data is missing promptTitleTemplate', async () => {
    ;(client.getNavigation as jest.Mock).mockResolvedValue({
      promptMessageTemplate: 'We detected you might prefer viewing this site in {language}',
      yesButtonTemplate: 'Yes, switch to {language}',
      noButtonText: 'No thanks',
    })
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })
  })

  it('should not show prompt when navigation data is missing promptMessageTemplate', async () => {
    ;(client.getNavigation as jest.Mock).mockResolvedValue({
      promptTitleTemplate: 'Switch to {language}?',
      yesButtonTemplate: 'Yes, switch to {language}',
      noButtonText: 'No thanks',
    })
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })
  })

  it('should not show prompt when navigation data is missing yesButtonTemplate', async () => {
    ;(client.getNavigation as jest.Mock).mockResolvedValue({
      promptTitleTemplate: 'Switch to {language}?',
      promptMessageTemplate: 'We detected you might prefer viewing this site in {language}',
      noButtonText: 'No thanks',
    })
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })
  })

  it('should not show prompt when navigation data is missing noButtonText', async () => {
    ;(client.getNavigation as jest.Mock).mockResolvedValue({
      promptTitleTemplate: 'Switch to {language}?',
      promptMessageTemplate: 'We detected you might prefer viewing this site in {language}',
      yesButtonTemplate: 'Yes, switch to {language}',
    })
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })
  })

  it('should handle handleAccept error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.updateUserPreferences as jest.Mock).mockRejectedValue(new Error('Update failed'))
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Click "Yes" button
    const yesButton = screen.getByText(/Yes, switch to Italiano/)
    fireEvent.click(yesButton)

    // Should log error
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to switch language:', expect.any(Error))
    })

    // Should not navigate
    expect(mockRouter.push).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should handle handleDismiss error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    ;(client.updateUserPreferences as jest.Mock).mockRejectedValue(new Error('Update failed'))
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Click "No" button
    const noButton = screen.getByText(/No thanks/)
    fireEvent.click(noButton)

    // Should log error
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to dismiss prompt:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should parse Hebrew language from pathname', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/he/products')
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    // Should show prompt (Hebrew != Italian)
    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })
  })

  it('should not show prompt when detected language is not found in languages list', async () => {
    ;(client.getLanguages as jest.Mock).mockResolvedValue([mockLanguages[0]]) // Only English
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: 'fr', // French not in list
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    // Should not show prompt
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })
  })

  it('should handle navigation from language-prefixed path', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en/products/test')
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to Italiano\?/)).toBeInTheDocument()
    })

    // Click "Yes"
    const yesButton = screen.getByText(/Yes, switch to Italiano/)
    fireEvent.click(yesButton)

    // Should navigate with language prefix
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/it/products/test')
    })
  })

  it('should handle navigation to default language with empty urlPrefix', async () => {
    const mockEnglishWithEmptyPrefix = {
      ...mockLanguages[0],
      urlPrefix: '',
    }
    ;(client.getLanguages as jest.Mock).mockResolvedValue([mockEnglishWithEmptyPrefix, mockLanguages[1]])
    ;(usePathname as jest.Mock).mockReturnValue('/it/products')
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.EN,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to English\?/)).toBeInTheDocument()
    })

    // Click "Yes"
    const yesButton = screen.getByText(/Yes, switch to English/)
    fireEvent.click(yesButton)

    // Should navigate without prefix
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/products')
    })
  })

  it('should handle navigation from root path with empty urlPrefix', async () => {
    const mockEnglishWithEmptyPrefix = {
      ...mockLanguages[0],
      urlPrefix: '',
    }
    ;(client.getLanguages as jest.Mock).mockResolvedValue([mockEnglishWithEmptyPrefix, mockLanguages[1]])
    ;(usePathname as jest.Mock).mockReturnValue('/it')
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.EN,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    await waitFor(() => {
      expect(screen.getByText(/Switch to English\?/)).toBeInTheDocument()
    })

    // Click "Yes"
    const yesButton = screen.getByText(/Yes, switch to English/)
    fireEvent.click(yesButton)

    // Should navigate to root
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  it('should not show prompt when getUserPreferences returns null', async () => {
    ;(client.getUserPreferences as jest.Mock).mockResolvedValue(null)
    ;(client.detectLanguage as jest.Mock).mockResolvedValue({
      detectedLanguage: CodeEnum.IT,
      shouldPrompt: true,
      confidence: 0.95,
    })

    render(<LanguagePrompt />)

    // Should not show prompt
    await waitFor(() => {
      expect(screen.queryByText(/Switch to/)).not.toBeInTheDocument()
    })
  })
})
