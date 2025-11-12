// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Style Guide page
 */

import { render, screen, fireEvent } from '@testing-library/react'
import StyleGuideClient from '@/app/[lang]/style-guide/StyleGuideClient'
import { LanguageCode } from '@/lib/types'
import { AuthProvider } from '@/lib/auth'
import * as authApi from '@/lib/auth/api'

// Mock the auth API
jest.mock('@/lib/auth/api')
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>

describe('Style Guide Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock refresh to fail (no active session for style guide)
    mockedAuthApi.refresh.mockRejectedValue(new Error('No session'))
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Design system reference for consistent UI development')).toBeInTheDocument()
      expect(screen.getByText('Color Palette')).toBeInTheDocument()
    })

    it('should display language code', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.IT} />
        </AuthProvider>
      )
      expect(screen.getByText('Language: IT')).toBeInTheDocument()
    })

    it('should render all main sections', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )

      // Check for all major sections
      expect(screen.getByText('Color Palette')).toBeInTheDocument()
      expect(screen.getByText('Typography')).toBeInTheDocument()
      expect(screen.getByText('Buttons')).toBeInTheDocument()
      expect(screen.getByText('Cards')).toBeInTheDocument()
      expect(screen.getByText('Form Elements')).toBeInTheDocument()
      expect(screen.getByText('Loading States')).toBeInTheDocument()
      expect(screen.getByText('Spacing Scale')).toBeInTheDocument()
      expect(screen.getByText('Shadows')).toBeInTheDocument()
      expect(screen.getByText('Border Radius')).toBeInTheDocument()
      expect(screen.getByText('Usage Guidelines')).toBeInTheDocument()
    })
  })

  describe('color palette', () => {
    it('should display primary colors', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Primary (Green)')).toBeInTheDocument()
    })

    it('should display secondary colors', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Secondary (Peach)')).toBeInTheDocument()
    })

    it('should display tertiary colors', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Tertiary (Teal)')).toBeInTheDocument()
    })

    it('should display semantic colors', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Success (Green - Semantic)')).toBeInTheDocument()
      expect(screen.getByText('Error (Red - Semantic)')).toBeInTheDocument()
      expect(screen.getByText('Warning (Yellow - Semantic)')).toBeInTheDocument()
      expect(screen.getByText('Neutral (Grayscale - Semantic)')).toBeInTheDocument()
    })
  })

  describe('typography', () => {
    it('should display heading examples', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Headings')).toBeInTheDocument()
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
      expect(screen.getByText('Heading 2')).toBeInTheDocument()
    })

    it('should display body text examples', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Body Text')).toBeInTheDocument()
    })

    it('should display font weights', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Font Weights')).toBeInTheDocument()
    })
  })

  describe('button components', () => {
    it('should display all button variants', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Primary Button')).toBeInTheDocument()
      expect(screen.getByText('Secondary Button')).toBeInTheDocument()
      expect(screen.getByText('Ghost Button')).toBeInTheDocument()
      expect(screen.getByText('Danger Button')).toBeInTheDocument()
    })

    it('should display all button sizes', () => {
      const { container } = render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should display button states', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      const disabledButton = screen.getByText('Disabled')
      expect(disabledButton).toBeDisabled()
    })
  })

  describe('card components', () => {
    it('should display default card', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Default Card')).toBeInTheDocument()
      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })

    it('should display product card', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Product Card')).toBeInTheDocument()
      expect(screen.getByText('Product Name')).toBeInTheDocument()
    })

    it('should display info card', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Info Card')).toBeInTheDocument()
      expect(screen.getByText('Information')).toBeInTheDocument()
    })

    it('should display feature card', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Feature Card')).toBeInTheDocument()
      expect(screen.getByText('Feature Highlight')).toBeInTheDocument()
    })
  })

  describe('form elements', () => {
    it('should display input fields', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Input Fields')).toBeInTheDocument()
      expect(screen.getByLabelText('Text Input')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Input')).toBeInTheDocument()
      expect(screen.getByLabelText('Password Input')).toBeInTheDocument()
      expect(screen.getByLabelText('Textarea')).toBeInTheDocument()
    })

    it('should display dropdown section', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Dropdown')).toBeInTheDocument()
      expect(screen.getByText('Select Option')).toBeInTheDocument()
    })

    it('should display checkboxes', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Checkboxes & Radio Buttons')).toBeInTheDocument()
      expect(screen.getByLabelText('Checkbox option 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Checkbox option 2')).toBeInTheDocument()
    })

    it('should handle checkbox interaction', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      const checkbox = screen.getByLabelText('Checkbox option 1') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })

    it('should display radio buttons', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByLabelText('Radio option 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Radio option 2')).toBeInTheDocument()
    })

    it('should handle radio button interaction', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      const radio1 = screen.getByLabelText('Radio option 1') as HTMLInputElement
      const radio2 = screen.getByLabelText('Radio option 2') as HTMLInputElement

      expect(radio1.checked).toBe(true) // Default is option1
      expect(radio2.checked).toBe(false)

      fireEvent.click(radio2)
      expect(radio2.checked).toBe(true)
    })
  })

  describe('loading states', () => {
    it('should display skeleton loaders', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Skeleton Loaders')).toBeInTheDocument()
    })

    it('should display spinner', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Spinner')).toBeInTheDocument()
    })
  })

  describe('spacing scale', () => {
    it('should display spacing examples', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Spacing Scale')).toBeInTheDocument()
    })
  })

  describe('shadows', () => {
    it('should display all shadow levels', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getAllByText('Small').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Default').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Medium').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Large').length).toBeGreaterThan(0)
    })
  })

  describe('border radius', () => {
    it('should display all radius options', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Border Radius')).toBeInTheDocument()
    })
  })

  describe('usage guidelines', () => {
    it('should display component reusability guidelines', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Component Reusability')).toBeInTheDocument()
    })

    it('should display adding new components guidelines', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Adding New Components')).toBeInTheDocument()
    })

    it('should display color usage guidelines', () => {
      render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      expect(screen.getByText('Color Usage')).toBeInTheDocument()
    })
  })

  describe('code examples', () => {
    it('should display code snippets for components', () => {
      const { container } = render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      const codeBlocks = container.querySelectorAll('code')
      expect(codeBlocks.length).toBeGreaterThan(0)
    })
  })

  describe('dark mode support', () => {
    it('should have dark mode classes', () => {
      const { container } = render(
        <AuthProvider>
          <StyleGuideClient lang={LanguageCode.EN} />
        </AuthProvider>
      )
      const darkModeElements = container.querySelectorAll('.dark\\:bg-neutral-900')
      expect(darkModeElements.length).toBeGreaterThan(0)
    })
  })
})
