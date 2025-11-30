// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for BrandFeaturesSection component (Brand Features Section)
 */

import { render, screen } from '@testing-library/react'

import { BrandFeaturesSection, type BrandFeaturesSectionProps } from '@/components/sections/BrandFeaturesSection'
import { AlignmentEnum, DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the CMSIcon and CMSText components
jest.mock('@/components/elements', () => ({
  Button: function MockButton({
    data,
    variant,
  }: {
    data?: { label?: { text?: string; icon?: string; ariaDescription?: string }; url?: string; openInNewTab?: boolean }
    variant?: string
  }) {
    if (!data) return null
    return (
      <a
        href={data.url}
        data-testid="mock-button"
        data-variant={variant}
        aria-label={data.label?.ariaDescription ?? data.label?.text}
        target={data.openInNewTab ? '_blank' : undefined}
        rel={data.openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {data.label?.text}
        {data.label?.icon && <span data-testid="mock-icon">{data.label.icon}</span>}
      </a>
    )
  },
  CMSIcon: function MockCMSIcon({ icon, size, className }: { icon?: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
  CMSText: function MockCMSText({ text }: { text?: string }) {
    return <>{text}</>
  },
  Label: function MockLabel({
    data,
    as: Tag = 'span',
    className,
  }: {
    data?: { text?: string; icon?: string; ariaDescription?: string }
    as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    hideIcon?: boolean
    className?: string
  }) {
    if (!data) return null
    if (Tag === 'h4') {
      return <h4 className={className}>{data.text}</h4>
    }
    return <span className={className}>{data.text}</span>
  },
}))

describe('BrandFeaturesSection', () => {
  const mockSectionData: BrandFeaturesSectionProps['data'] = {
    __component: 'sections.brand-features-section',
    id: 1,
    showHeader: true,
    headerText: 'Why Choose <span class="text-primary">TheGreenBrother?</span>',
    headerAriaDescription: 'Brand features section',
    headerIcon: 'star',
    subheaderText: 'We make conscious consumption simple and transparent.',
    subheaderAriaDescription: 'Features description',
    headerAlignment: AlignmentEnum.LANGUAGE_DIRECTION,
    learnMoreButtonText: 'Learn more about our mission',
    learnMoreButtonUrl: '/about',
    learnMoreButtonAriaDescription: 'Navigate to about page',
    learnMoreButtonOpenInNewTab: false,
    learnMoreButtonIcon: 'arrow_forward',
    features: [
      {
        id: 1,
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        header: {
          text: 'Vetted Brands',
          ariaDescription: 'Vetted brands feature',

          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'verified',
        },
        subheader: {
          text: 'We only partner with brands that meet our strict sustainability criteria.',
          ariaDescription: 'Vetted brands description',

          iconPosition: IconPositionEnum.BEFORE_TEXT,
        },
      },
      {
        id: 2,
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        header: {
          text: 'Support the Planet',
          ariaDescription: 'Support the planet feature',

          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'public',
        },
        subheader: {
          text: 'Every purchase contributes to a healthier Earth.',
          ariaDescription: 'Support description',

          iconPosition: IconPositionEnum.BEFORE_TEXT,
        },
      },
      {
        id: 3,
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        header: {
          text: 'Exclusive Deals',
          ariaDescription: 'Exclusive deals feature',

          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'sell',
        },
        subheader: {
          text: 'Access special offers on the best sustainable products.',
          ariaDescription: 'Deals description',

          iconPosition: IconPositionEnum.BEFORE_TEXT,
        },
      },
      {
        id: 4,
        alignment: AlignmentEnum.LANGUAGE_DIRECTION,
        header: {
          text: 'Circular Economy',
          ariaDescription: 'Circular economy feature',

          iconPosition: IconPositionEnum.BEFORE_TEXT,
          icon: 'recycling',
        },
        subheader: {
          text: 'Products designed for minimal waste and maximum reuse.',
          ariaDescription: 'Circular description',

          iconPosition: IconPositionEnum.BEFORE_TEXT,
        },
      },
    ],
  }

  it('should render section with header text (as HTML)', () => {
    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('should render subheader when provided', () => {
    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    expect(screen.getByText('We make conscious consumption simple and transparent.')).toBeInTheDocument()
  })

  it('should not render subheader when not provided', () => {
    // Use destructuring to create a version without subheaderText
    const { subheaderText: _subheaderText, ...restOfMockData } = mockSectionData
    const dataWithoutSubheader = restOfMockData as BrandFeaturesSectionProps['data']

    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutSubheader} />)

    expect(screen.queryByText('We make conscious consumption simple and transparent.')).not.toBeInTheDocument()
  })

  it('should render learn more button with correct link', () => {
    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    const link = screen.getByRole('link', { name: /Navigate to about page/i })
    expect(link).toHaveAttribute('href', '/about')
    expect(screen.getByText('Learn more about our mission')).toBeInTheDocument()
  })

  it('should render all features', () => {
    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    expect(screen.getByText('Vetted Brands')).toBeInTheDocument()
    expect(screen.getByText('Support the Planet')).toBeInTheDocument()
    expect(screen.getByText('Exclusive Deals')).toBeInTheDocument()
    expect(screen.getByText('Circular Economy')).toBeInTheDocument()
  })

  it('should render feature descriptions', () => {
    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    expect(
      screen.getByText('We only partner with brands that meet our strict sustainability criteria.')
    ).toBeInTheDocument()
    expect(screen.getByText('Every purchase contributes to a healthier Earth.')).toBeInTheDocument()
    expect(screen.getByText('Access special offers on the best sustainable products.')).toBeInTheDocument()
    expect(screen.getByText('Products designed for minimal waste and maximum reuse.')).toBeInTheDocument()
  })

  it('should render feature icons', () => {
    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    const icons = screen.getAllByTestId('mock-icon')
    // 4 feature icons + 1 learn more button icon = 5 total
    expect(icons).toHaveLength(5)

    // Check feature icons (starting from index 1, after learn more icon)
    expect(icons[1]).toHaveAttribute('data-icon', 'verified')
    expect(icons[2]).toHaveAttribute('data-icon', 'public')
    expect(icons[3]).toHaveAttribute('data-icon', 'sell')
    expect(icons[4]).toHaveAttribute('data-icon', 'recycling')
  })

  it('should open learn more link in new tab when configured', () => {
    const dataWithNewTab: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      learnMoreButtonOpenInNewTab: true,
    }

    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithNewTab} />)

    const link = screen.getByRole('link', { name: /Navigate to about page/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should not render feature subheader when not provided', () => {
    const { subheader: _subheader, ...featureWithoutSubheader } = mockSectionData.features[0]!
    const dataWithoutFeatureSubheader: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      features: [featureWithoutSubheader],
    }

    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutFeatureSubheader} />)

    expect(
      screen.queryByText('We only partner with brands that meet our strict sustainability criteria.')
    ).not.toBeInTheDocument()
  })

  it('should have correct aria-label on section', () => {
    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    const section = screen.getByRole('region', { name: 'Brand features section' })
    expect(section).toBeInTheDocument()
  })

  it('should render decorative background elements', () => {
    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    const decorativeElements = container.querySelectorAll('.rounded-full.blur-3xl')
    expect(decorativeElements).toHaveLength(2)
  })

  it('should not render header when headerText is not provided', () => {
    // Use destructuring and rest operator to create a version without headerText
    const { headerText: _headerText, ...restOfMockData } = mockSectionData
    const dataWithoutHeader = restOfMockData as BrandFeaturesSectionProps['data']

    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutHeader} />)

    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('should not render learn more button when URL is not provided', () => {
    // Use destructuring and rest operator to create a version without learnMoreButtonUrl
    const { learnMoreButtonUrl: _url, ...restOfMockData } = mockSectionData
    const dataWithoutButton = restOfMockData as BrandFeaturesSectionProps['data']

    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutButton} />)

    expect(screen.queryByRole('link', { name: /Navigate to about page/i })).not.toBeInTheDocument()
  })

  it('should not render feature when header is not provided', () => {
    const dataWithInvalidFeature: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      features: [{ id: 1, alignment: AlignmentEnum.LANGUAGE_DIRECTION }, ...mockSectionData.features],
    }

    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithInvalidFeature} />)

    // Should still render valid features
    expect(screen.getByText('Vetted Brands')).toBeInTheDocument()
  })

  it('should use justify-center alignment when headerAlignment is CENTER', () => {
    const dataWithCenterAlignment: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      headerAlignment: AlignmentEnum.CENTER,
    }

    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithCenterAlignment} />)

    const buttonContainer = container.querySelector('.justify-center')
    expect(buttonContainer).toBeInTheDocument()
  })

  it('should use justify-end alignment for RTL direction', () => {
    const { DirectionEnum } =
      jest.requireActual<typeof import('@/lib/generated/types.gen')>('@/lib/generated/types.gen')

    const { container } = render(<BrandFeaturesSection data={mockSectionData} direction={DirectionEnum.RTL} />)

    const buttonContainer = container.querySelector('.justify-end')
    expect(buttonContainer).toBeInTheDocument()
  })

  it('should use justify-start alignment for LTR direction (default)', () => {
    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    const buttonContainer = container.querySelector('.justify-start')
    expect(buttonContainer).toBeInTheDocument()
  })
})
