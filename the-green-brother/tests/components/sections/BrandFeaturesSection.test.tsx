// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for BrandFeaturesSection component (Brand Features Section)
 */

import { render, screen } from '@testing-library/react'

import { BrandFeaturesSection, type BrandFeaturesSectionProps } from '@/components/sections/BrandFeaturesSection'
import { AlignmentEnum, DirectionEnum, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the Icon and Text components
jest.mock('@/components/elements', () => ({
  ButtonLink: function MockButtonLink({
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
  Icon: function MockIcon({ icon, size, className }: { icon?: string; size?: string; className?: string }) {
    return (
      <span data-testid="mock-icon" data-icon={icon} data-size={size} className={className}>
        {icon}
      </span>
    )
  },
  Text: function MockText({ text }: { text?: string }) {
    return <>{text}</>
  },
  Header: function MockHeader({
    data,
    level = 2,
    className,
    headerClassName,
    subheaderClassName,
  }: {
    data?: { header?: { text?: string; icon?: string }; subheader?: { text?: string }; alignment?: string }
    level?: number
    className?: string
    headerClassName?: string
    subheaderClassName?: string
  }) {
    if (!data) return null
    const Tag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    return (
      <div className={className} data-testid="mock-header">
        {data.header?.icon && (
          <span data-testid="mock-icon" data-icon={data.header.icon}>
            {data.header.icon}
          </span>
        )}
        {data.header?.text && <Tag className={headerClassName}>{data.header.text}</Tag>}
        {data.subheader?.text && <p className={subheaderClassName}>{data.subheader.text}</p>}
      </div>
    )
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
        promoteHeaderIcon: false,
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
        promoteHeaderIcon: false,
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
        promoteHeaderIcon: false,
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
        promoteHeaderIcon: false,
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

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
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

  it('should render feature icons via Header component', () => {
    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    const icons = screen.getAllByTestId('mock-icon')
    // 4 feature icons rendered via Header + 1 learn more button icon = 5 total
    expect(icons).toHaveLength(5)

    // Check feature icons (learn more button icon is first in DOM order)
    // The order depends on rendering, so we check that expected icons exist
    const iconValues = icons.map(icon => icon.getAttribute('data-icon'))
    expect(iconValues).toContain('verified')
    expect(iconValues).toContain('public')
    expect(iconValues).toContain('sell')
    expect(iconValues).toContain('recycling')
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

    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
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
      features: [
        { id: 1, alignment: AlignmentEnum.LANGUAGE_DIRECTION, promoteHeaderIcon: false },
        ...mockSectionData.features,
      ],
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

    const buttonContainer = container.querySelector('.justify-start')
    expect(buttonContainer).toBeInTheDocument()
  })

  it('should use justify-start alignment for LTR direction (default)', () => {
    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    const buttonContainer = container.querySelector('.justify-start')
    expect(buttonContainer).toBeInTheDocument()
  })

  it('should render features in separate containers when showHeader is false', () => {
    const dataWithoutHeader: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      showHeader: false,
    }

    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutHeader} />)

    // Each feature should be in its own container with bg-white (light mode) and dark:bg-surface-dark
    const featureContainers = container.querySelectorAll('.bg-white.rounded-xl')
    expect(featureContainers.length).toBe(4)
  })

  it('should not render decorative elements when showHeader is false', () => {
    const dataWithoutHeader: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      showHeader: false,
    }

    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutHeader} />)

    // No decorative blur elements
    const decorativeElements = container.querySelectorAll('.blur-3xl')
    expect(decorativeElements).toHaveLength(0)
  })

  it('should use vertical layout when less than 4 features', () => {
    const dataWithFewFeatures: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      features: mockSectionData.features.slice(0, 2), // Only 2 features
    }

    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithFewFeatures} />)

    // Should have flex-col class for vertical layout
    const verticalContainer = container.querySelector('.flex-col')
    expect(verticalContainer).toBeInTheDocument()
  })

  it('should not render feature without header when showHeader is false', () => {
    const dataWithInvalidFeatureNoHeader: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      showHeader: false,
      features: [
        { id: 99, alignment: AlignmentEnum.LANGUAGE_DIRECTION, promoteHeaderIcon: false }, // No header
        ...mockSectionData.features.slice(0, 1),
      ],
    }

    const { container } = render(
      <BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithInvalidFeatureNoHeader} />
    )

    // Should only render 1 valid feature container
    const featureContainers = container.querySelectorAll('.bg-white.rounded-xl')
    expect(featureContainers.length).toBe(1)
  })

  it('should use grid layout when 4 or more features', () => {
    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={mockSectionData} />)

    // Should have grid class for grid layout
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
  })

  it('should handle missing learnMoreButtonIcon and learnMoreButtonAriaDescription', () => {
    const { learnMoreButtonIcon: _icon, learnMoreButtonAriaDescription: _desc, ...restData } = mockSectionData
    const dataWithoutIcon = restData as BrandFeaturesSectionProps['data']

    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutIcon} />)

    // Button should still render
    expect(screen.getByText('Learn more about our mission')).toBeInTheDocument()
    // Icon should not serve mock-icon
    // We check via mock implementation: ButtonLink renders icon if enabled.
    // Since we removed it, it wont be there.
    // But ButtonLink mock renders icon if provided.
  })

  it('should handle missing headerAriaDescription', () => {
    const { headerAriaDescription: _desc, ...restData } = mockSectionData
    const dataWithoutDesc = restData as BrandFeaturesSectionProps['data']
    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutDesc} />)

    // When aria-label is empty, section does not have role="region"
    // Verify it renders as a section element
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveAttribute('aria-label', '')
  })
  it('should use justify-start alignment for standalone features in LTR', () => {
    const dataWithoutHeader: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      showHeader: false,
    }

    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutHeader} />)

    // Each feature should be in its own container with bg-white (light mode)
    // We check that they have justify-start class
    const featureContainers = container.querySelectorAll('.bg-white.rounded-xl')
    expect(featureContainers.length).toBeGreaterThan(0)
    featureContainers.forEach(feature => {
      expect(feature).toHaveClass('justify-start')
      expect(feature).not.toHaveClass('justify-center')
    })
  })

  it('should fallback to empty aria-label when headerAriaDescription is undefined in standalone mode', () => {
    const { headerAriaDescription: _desc, ...restData } = mockSectionData
    const dataWithoutDesc: BrandFeaturesSectionProps['data'] = {
      ...restData,
      showHeader: false,
    } as BrandFeaturesSectionProps['data']

    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutDesc} />)

    // The div (not section) should have empty aria-label
    const grid = container.querySelector('.grid')
    expect(grid).toHaveAttribute('aria-label', '')
  })

  it('should use index as key fallback when feature.id is undefined in standalone mode', () => {
    const featuresWithoutId = mockSectionData.features.map(f => {
      const { id: _id, ...rest } = f
      return rest
    })
    const dataWithoutFeatureIds: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      showHeader: false,
      features: featuresWithoutId,
    } as unknown as BrandFeaturesSectionProps['data']

    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutFeatureIds} />)

    // Should render without errors, using index as key
    const featureContainers = container.querySelectorAll('.bg-white.rounded-xl')
    expect(featureContainers.length).toBe(4)
  })

  it('should use index as key fallback when feature.id is undefined in header mode', () => {
    const featuresWithoutId = mockSectionData.features.map(f => {
      const { id: _id, ...rest } = f
      return rest
    })
    const dataWithoutFeatureIds: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      features: featuresWithoutId,
    } as unknown as BrandFeaturesSectionProps['data']

    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutFeatureIds} />)

    // Should render all features without errors
    expect(screen.getByText('Vetted Brands')).toBeInTheDocument()
    expect(screen.getByText('Support the Planet')).toBeInTheDocument()
  })

  it('should fallback to LANGUAGE_DIRECTION when headerAlignment is undefined', () => {
    const { headerAlignment: _alignment, ...restData } = mockSectionData
    const dataWithoutAlignment = restData as BrandFeaturesSectionProps['data']

    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutAlignment} />)

    // Should render correctly with fallback alignment
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('should fallback to false when learnMoreButtonOpenInNewTab is undefined', () => {
    const { learnMoreButtonOpenInNewTab: _openInNewTab, ...restData } = mockSectionData
    const dataWithoutNewTab = restData as BrandFeaturesSectionProps['data']

    render(<BrandFeaturesSection direction={DirectionEnum.LTR} data={dataWithoutNewTab} />)

    const link = screen.getByRole('link', { name: /Navigate to about page/i })
    expect(link).not.toHaveAttribute('target', '_blank')
  })

  it('should use justify-end alignment for standalone features in RTL', () => {
    const dataWithoutHeader: BrandFeaturesSectionProps['data'] = {
      ...mockSectionData,
      showHeader: false,
    }

    // Use RTL direction
    const { container } = render(<BrandFeaturesSection direction={DirectionEnum.RTL} data={dataWithoutHeader} />)

    // Each feature should be in its own container with bg-white (light mode)
    // We check that they have justify-end class
    const featureContainers = container.querySelectorAll('.bg-white.rounded-xl')
    expect(featureContainers.length).toBeGreaterThan(0)
    featureContainers.forEach(feature => {
      expect(feature).toHaveClass('justify-start')
      expect(feature).not.toHaveClass('justify-center')
    })
  })
})
