// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for Header component
 */

import { render, screen } from '@testing-library/react'

import { Header, HeaderLevel, type HeaderProps } from '@/components/elements/Header'
import { AlignmentEnum, DirectionEnum, type ElementsHeaderEntry, IconPositionEnum } from '@/lib/generated/types.gen'

// Mock the Label component (Header uses relative import)
jest.mock('@/components/elements/Label', () => ({
  __esModule: true,
  default: function MockLabel({
    data,
    as: Tag = 'span',
    iconSize,
    className,
    textClassName,
  }: {
    data?: { text?: string; ariaDescription?: string }
    as?: string
    iconSize?: string
    className?: string
    textClassName?: string
  }) {
    // Handle heading tags - use div to avoid type issues
    if (Tag.startsWith('h')) {
      const level = parseInt(Tag.charAt(1), 10)
      return (
        <div
          data-testid={`mock-label-${Tag}`}
          data-icon-size={iconSize}
          className={className}
          role="heading"
          aria-level={level}
        >
          <span data-testid={`mock-label-${Tag}-text`} className={textClassName}>
            {data?.text}
          </span>
        </div>
      )
    }
    return (
      <span data-testid={`mock-label-${Tag}`} data-icon-size={iconSize} className={className}>
        <span data-testid={`mock-label-${Tag}-text`} className={textClassName}>
          {data?.text}
        </span>
      </span>
    )
  },
  Label: function MockLabel({
    data,
    as: Tag = 'span',
    iconSize,
    className,
    textClassName,
  }: {
    data?: { text?: string; ariaDescription?: string }
    as?: string
    iconSize?: string
    className?: string
    textClassName?: string
  }) {
    // Handle heading tags - use div to avoid type issues
    if (Tag.startsWith('h')) {
      const level = parseInt(Tag.charAt(1), 10)
      return (
        <div
          data-testid={`mock-label-${Tag}`}
          data-icon-size={iconSize}
          className={className}
          role="heading"
          aria-level={level}
        >
          <span data-testid={`mock-label-${Tag}-text`} className={textClassName}>
            {data?.text}
          </span>
        </div>
      )
    }
    return (
      <span data-testid={`mock-label-${Tag}`} data-icon-size={iconSize} className={className}>
        <span data-testid={`mock-label-${Tag}-text`} className={textClassName}>
          {data?.text}
        </span>
      </span>
    )
  },
}))

describe('Header', () => {
  const mockHeaderData: HeaderProps['data'] = {
    alignment: AlignmentEnum.CENTER,
    promoteHeaderIcon: false,
    header: {
      text: 'Main Heading',
      icon: 'star',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      ariaDescription: 'Main heading description',
    },
    subheader: {
      text: 'Subheading text',
      icon: 'info',
      iconPosition: IconPositionEnum.AFTER_TEXT,
      ariaDescription: 'Subheading description',
    },
  }

  it('should render null when data is undefined', () => {
    const { container } = render(<Header direction={DirectionEnum.LTR} data={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render header text', () => {
    render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} />)
    expect(screen.getByText('Main Heading')).toBeInTheDocument()
  })

  it('should render subheader when provided', () => {
    render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} />)
    expect(screen.getByText('Subheading text')).toBeInTheDocument()
  })

  it('should not render subheader when not provided', () => {
    const dataWithoutSubheader = { ...mockHeaderData, subheader: undefined } as unknown as ElementsHeaderEntry
    render(<Header direction={DirectionEnum.LTR} data={dataWithoutSubheader} />)
    expect(screen.queryByText('Subheading text')).not.toBeInTheDocument()
  })

  it('should not render header when header is undefined', () => {
    const dataWithoutHeader = { ...mockHeaderData, header: undefined } as unknown as ElementsHeaderEntry
    render(<Header direction={DirectionEnum.LTR} data={dataWithoutHeader} />)
    expect(screen.queryByText('Main Heading')).not.toBeInTheDocument()
  })

  it('should apply text-center class for CENTER alignment', () => {
    const { container } = render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} />)
    expect(container.firstChild).toHaveClass('text-center')
  })

  it('should apply text-left class for LANGUAGE_DIRECTION alignment in LTR', () => {
    const dataWithLanguageDirection = {
      ...mockHeaderData,
      alignment: AlignmentEnum.LANGUAGE_DIRECTION,
      promoteHeaderIcon: false,
    }
    const { container } = render(<Header data={dataWithLanguageDirection} direction={DirectionEnum.LTR} />)
    expect(container.firstChild).toHaveClass('text-left')
    expect(container.firstChild).toHaveClass('justify-start')
  })

  it('should apply text-right class for LANGUAGE_DIRECTION alignment in RTL', () => {
    const dataWithLanguageDirection = {
      ...mockHeaderData,
      alignment: AlignmentEnum.LANGUAGE_DIRECTION,
      promoteHeaderIcon: false,
    }
    const { container } = render(<Header data={dataWithLanguageDirection} direction={DirectionEnum.RTL} />)
    expect(container.firstChild).toHaveClass('text-right')
    expect(container.firstChild).toHaveClass('justify-start')
  })

  it('should render with h2 by default', () => {
    render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} />)
    expect(screen.getByTestId('mock-label-h2')).toBeInTheDocument()
  })

  it('should render with custom heading level', () => {
    render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} level={1} />)
    expect(screen.getByTestId('mock-label-h1')).toBeInTheDocument()
  })

  it('should pass headerIconSize to header Label', () => {
    render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} headerIconSize="xl" />)
    const headerLabel = screen.getByTestId('mock-label-h2')
    expect(headerLabel).toHaveAttribute('data-icon-size', 'xl')
  })

  it('should pass subheaderIconSize to subheader Label', () => {
    render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} subheaderIconSize="lg" />)
    const subheaderLabel = screen.getByTestId('mock-label-p')
    expect(subheaderLabel).toHaveAttribute('data-icon-size', 'lg')
  })

  it('should apply custom className to container', () => {
    const { container } = render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} className="w-full" />)
    expect(container.firstChild).toHaveClass('w-full')
  })

  it('should apply headerClassName to header Label', () => {
    render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} headerClassName="custom-header" />)
    const headerLabel = screen.getByTestId('mock-label-h2')
    expect(headerLabel.className).toContain('custom-header')
  })

  it('should apply subheaderClassName to subheader Label', () => {
    render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} subheaderClassName="custom-subheader" />)
    const subheaderLabel = screen.getByTestId('mock-label-p')
    expect(subheaderLabel.className).toContain('custom-subheader')
  })

  it('should apply justify-center class for CENTER alignment', () => {
    render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} />)
    const headerLabel = screen.getByTestId('mock-label-h2')
    expect(headerLabel.className).toContain('justify-center')
  })

  it('should not apply justify-center for LANGUAGE_DIRECTION alignment', () => {
    const dataWithLanguageDirection = {
      ...mockHeaderData,
      alignment: AlignmentEnum.LANGUAGE_DIRECTION,
      promoteHeaderIcon: false,
    }
    render(<Header direction={DirectionEnum.LTR} data={dataWithLanguageDirection} />)
    const headerLabel = screen.getByTestId('mock-label-h2')
    expect(headerLabel.className).not.toContain('justify-center')
  })

  it('should render all heading levels correctly', () => {
    const levels: HeaderLevel[] = [1, 2, 3, 4, 5, 6]
    levels.forEach(level => {
      const { unmount } = render(<Header direction={DirectionEnum.LTR} data={mockHeaderData} level={level} />)
      expect(screen.getByTestId(`mock-label-h${String(level)}`)).toBeInTheDocument()
      unmount()
    })
  })

  it('should render promoted layout when promoteHeaderIcon is true and icon exists', () => {
    const dataWithPromotedIcon = {
      ...mockHeaderData,
      promoteHeaderIcon: true,
    }
    render(<Header direction={DirectionEnum.LTR} data={dataWithPromotedIcon} />)
    // Should still render header and subheader text
    expect(screen.getByText('Main Heading')).toBeInTheDocument()
    expect(screen.getByText('Subheading text')).toBeInTheDocument()
  })

  it('should render promoted layout with center alignment', () => {
    const dataWithPromotedIconCenter = {
      ...mockHeaderData,
      promoteHeaderIcon: true,
      alignment: AlignmentEnum.CENTER,
    }
    const { container } = render(<Header direction={DirectionEnum.LTR} data={dataWithPromotedIconCenter} />)
    // Should have justify-center class for center alignment
    const flexContainer = container.querySelector('.flex.justify-center')
    expect(flexContainer).toBeInTheDocument()
    // Should align items to start (top)
    expect(flexContainer).toHaveClass('items-start')
  })

  it('should render promoted layout with RTL direction', () => {
    const dataWithPromotedIconRTL = {
      ...mockHeaderData,
      promoteHeaderIcon: true,
      alignment: AlignmentEnum.LANGUAGE_DIRECTION,
    }
    render(<Header direction={DirectionEnum.RTL} data={dataWithPromotedIconRTL} />)
    // Should render header and subheader text
    expect(screen.getByText('Main Heading')).toBeInTheDocument()
    expect(screen.getByText('Subheading text')).toBeInTheDocument()
  })

  it('should render non-promoted layout when promoteHeaderIcon is true but no icon', () => {
    const dataWithoutIcon = {
      ...mockHeaderData,
      promoteHeaderIcon: true,
      header: {
        ...mockHeaderData.header,
        icon: undefined,
      },
    } as unknown as ElementsHeaderEntry
    render(<Header direction={DirectionEnum.LTR} data={dataWithoutIcon} />)
    // Should render header in standard layout
    expect(screen.getByText('Main Heading')).toBeInTheDocument()
  })

  it('should render promoted layout without subheader', () => {
    const dataWithPromotedNoSubheader = {
      ...mockHeaderData,
      promoteHeaderIcon: true,
      subheader: undefined,
    } as unknown as ElementsHeaderEntry
    render(<Header direction={DirectionEnum.LTR} data={dataWithPromotedNoSubheader} />)
    expect(screen.getByText('Main Heading')).toBeInTheDocument()
    expect(screen.queryByText('Subheading text')).not.toBeInTheDocument()
  })

  it('should pass subheaderTextClassName to Label textClassName', () => {
    render(
      <Header data={mockHeaderData} direction={DirectionEnum.LTR} subheaderTextClassName="line-clamp-2 custom-class" />
    )

    // The subheader text span should have the classes
    const subheaderText = screen.getByTestId('mock-label-p-text')
    expect(subheaderText).toHaveClass('line-clamp-2')
    expect(subheaderText).toHaveClass('custom-class')
  })

  it('should pass subheaderTextClassName to Label textClassName in promoted layout', () => {
    const dataWithPromotedIcon = {
      ...mockHeaderData,
      promoteHeaderIcon: true,
    }
    render(<Header data={dataWithPromotedIcon} direction={DirectionEnum.LTR} subheaderTextClassName="line-clamp-3" />)

    // The subheader text span should have the class in promoted layout
    const subheaderText = screen.getByTestId('mock-label-p-text')
    expect(subheaderText).toHaveClass('line-clamp-3')
  })

  it('should apply text-left on header and subheader in promoted layout with LTR LANGUAGE_DIRECTION alignment', () => {
    const dataWithPromotedLTR = {
      ...mockHeaderData,
      promoteHeaderIcon: true,
      alignment: AlignmentEnum.LANGUAGE_DIRECTION,
    }
    render(<Header data={dataWithPromotedLTR} direction={DirectionEnum.LTR} />)

    // The header label should have text-left in LTR promoted layout
    const headerLabel = screen.getByTestId('mock-label-h2')
    expect(headerLabel.className).toContain('text-left')
    // The subheader should also have text-left
    const subheaderLabel = screen.getByTestId('mock-label-p')
    expect(subheaderLabel.className).toContain('text-left')
  })

  it('should apply text-right on header and subheader in promoted layout with RTL LANGUAGE_DIRECTION alignment', () => {
    const dataWithPromotedRTL = {
      ...mockHeaderData,
      promoteHeaderIcon: true,
      alignment: AlignmentEnum.LANGUAGE_DIRECTION,
    }
    render(<Header data={dataWithPromotedRTL} direction={DirectionEnum.RTL} />)

    // The header label should have text-right in RTL promoted layout
    const headerLabel = screen.getByTestId('mock-label-h2')
    expect(headerLabel.className).toContain('text-right')
    // The subheader should also have text-right
    const subheaderLabel = screen.getByTestId('mock-label-p')
    expect(subheaderLabel.className).toContain('text-right')
  })

  it('should render null when visible is false', () => {
    const { container } = render(<Header data={mockHeaderData} direction={DirectionEnum.LTR} visible={false} />)
    expect(container.firstChild).toBeNull()
  })
})
