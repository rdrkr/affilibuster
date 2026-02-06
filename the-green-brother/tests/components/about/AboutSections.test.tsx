// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Unit tests for AboutSections component
 */

import { render, screen } from '@testing-library/react'

import { AboutSections } from '@/components/about/AboutSections'
import type { ApiAboutAboutDocument } from '@/lib/generated/types.gen'
import { DirectionEnum } from '@/lib/generated/types.gen'

// Mock the section components
jest.mock('@/components/sections', () => ({
  HeroSection: function MockHeroSection({ data }: { data: { id: number } }) {
    return <div data-testid={`hero-section-${String(data.id)}`}>Hero Section</div>
  },
  TeamSection: function MockTeamSection({ data }: { data: { id: number } }) {
    return <div data-testid={`team-section-${String(data.id)}`}>Team Section</div>
  },
  BrandFeaturesSection: function MockBrandFeaturesSection({ data }: { data: { id: number } }) {
    return <div data-testid={`brand-features-section-${String(data.id)}`}>Brand Features Section</div>
  },
}))

// Mock TextBlock
jest.mock('@/components/elements', () => ({
  TextBlock: function MockTextBlock({ data }: { data: { id: number } }) {
    return <div data-testid={`text-block-${String(data.id)}`}>Text Block</div>
  },
}))

// Mock DynamicZone
jest.mock('@/components/layout', () => ({
  DynamicZone: function MockDynamicZone({
    sections,
    renderSection,
    direction,
    className,
  }: {
    sections: { __component: string; id: number }[]
    renderSection: (section: { __component: string; id: number }) => React.ReactNode
    direction?: string
    className?: string
  }) {
    return (
      <div data-testid="dynamic-zone" data-direction={direction} className={className}>
        {sections.map(section => (
          <div key={section.id}>{renderSection(section)}</div>
        ))}
      </div>
    )
  },
}))

type AboutSection = ApiAboutAboutDocument['sections'][number]

describe('AboutSections', () => {
  it('should render hero sections', () => {
    const sections: AboutSection[] = [
      {
        __component: 'sections.hero',
        id: 1,
      } as AboutSection,
    ]

    render(<AboutSections direction={DirectionEnum.LTR} sections={sections} />)

    expect(screen.getByTestId('hero-section-1')).toBeInTheDocument()
    expect(screen.getByText('Hero Section')).toBeInTheDocument()
  })

  it('should render team sections', () => {
    const sections: AboutSection[] = [
      {
        __component: 'sections.team-grid',
        id: 1,
      } as AboutSection,
    ]

    render(<AboutSections direction={DirectionEnum.LTR} sections={sections} />)

    expect(screen.getByTestId('team-section-1')).toBeInTheDocument()
    expect(screen.getByText('Team Section')).toBeInTheDocument()
  })

  it('should render brand features sections', () => {
    const sections: AboutSection[] = [
      {
        __component: 'sections.brand-features-section',
        id: 1,
      } as AboutSection,
    ]

    render(<AboutSections direction={DirectionEnum.LTR} sections={sections} />)

    expect(screen.getByTestId('brand-features-section-1')).toBeInTheDocument()
    expect(screen.getByText('Brand Features Section')).toBeInTheDocument()
  })

  it('should render text blocks', () => {
    const sections: AboutSection[] = [
      {
        __component: 'elements.text-block',
        id: 1,
      } as AboutSection,
    ]

    render(<AboutSections direction={DirectionEnum.LTR} sections={sections} />)

    expect(screen.getByTestId('text-block-1')).toBeInTheDocument()
    expect(screen.getByText('Text Block')).toBeInTheDocument()
  })

  it('should render multiple sections', () => {
    const sections: AboutSection[] = [
      { __component: 'sections.hero', id: 1 } as AboutSection,
      { __component: 'sections.team-grid', id: 2 } as AboutSection,
      { __component: 'sections.brand-features-section', id: 3 } as AboutSection,
    ]

    render(<AboutSections direction={DirectionEnum.LTR} sections={sections} />)

    expect(screen.getByTestId('hero-section-1')).toBeInTheDocument()
    expect(screen.getByTestId('team-section-2')).toBeInTheDocument()
    expect(screen.getByTestId('brand-features-section-3')).toBeInTheDocument()
  })

  it('should pass direction to DynamicZone', () => {
    const sections: AboutSection[] = [{ __component: 'sections.hero', id: 1 } as AboutSection]

    render(<AboutSections sections={sections} direction={DirectionEnum.RTL} />)

    const dynamicZone = screen.getByTestId('dynamic-zone')
    expect(dynamicZone).toHaveAttribute('data-direction', DirectionEnum.RTL)
  })

  it('should use ltr as default direction', () => {
    const sections: AboutSection[] = [{ __component: 'sections.hero', id: 1 } as AboutSection]

    render(<AboutSections direction={DirectionEnum.LTR} sections={sections} />)

    const dynamicZone = screen.getByTestId('dynamic-zone')
    expect(dynamicZone).toHaveAttribute('data-direction', DirectionEnum.LTR)
  })

  it('should return null for unknown section types', () => {
    const sections: AboutSection[] = [{ __component: 'unknown.component', id: 1 } as unknown as AboutSection]

    render(<AboutSections direction={DirectionEnum.LTR} sections={sections} />)

    // The dynamic zone should be rendered but the section should return null
    expect(screen.getByTestId('dynamic-zone')).toBeInTheDocument()
    expect(screen.queryByTestId('hero-section-1')).not.toBeInTheDocument()
  })

  it('should not render marker sections', () => {
    const sections = [
      { __component: 'markers.start-horizontal-layout-marker', id: 1 } as AboutSection,
      { __component: 'sections.hero', id: 2 } as AboutSection,
      { __component: 'markers.end-horizontal-layout-marker', id: 3 } as AboutSection,
    ]

    render(<AboutSections direction={DirectionEnum.LTR} sections={sections} />)

    expect(screen.getByTestId('hero-section-2')).toBeInTheDocument()
    // Markers should return null and not render anything visible
    expect(screen.queryByText('markers')).not.toBeInTheDocument()
  })

  it('should handle empty sections array', () => {
    render(<AboutSections direction={DirectionEnum.LTR} sections={[]} />)

    const dynamicZone = screen.getByTestId('dynamic-zone')
    expect(dynamicZone).toBeInTheDocument()
    expect(dynamicZone.children).toHaveLength(0)
  })

  it('should use default empty contributors array when not provided', () => {
    const sections: AboutSection[] = [
      {
        __component: 'sections.team-grid',
        id: 1,
      } as AboutSection,
    ]

    // Render without contributors prop to test the default parameter
    render(<AboutSections direction={DirectionEnum.LTR} sections={sections} />)

    expect(screen.getByTestId('team-section-1')).toBeInTheDocument()
    expect(screen.getByText('Team Section')).toBeInTheDocument()
  })
})
