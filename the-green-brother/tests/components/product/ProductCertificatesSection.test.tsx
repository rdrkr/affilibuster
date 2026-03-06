// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { render, screen } from '@testing-library/react'

import { ProductCertificatesSection } from '@/components/product/ProductCertificatesSection'
import {
  AlignmentEnum,
  DirectionEnum,
  IconPositionEnum,
  type ApiProductCertificateProductCertificateDocument,
  type ElementsHeaderEntry,
} from '@/lib/generated/types.gen'

// Mock ShortcutsGrid and other elements
jest.mock('@/components/elements', () => ({
  ShortcutsGrid: function MockShortcutsGrid({
    header,
    items,
  }: {
    header: any
    items: { id: number; url: string; label: any }[]
  }) {
    return (
      <div data-testid="shortcuts-grid">
        {header && <div data-testid="grid-header">{header.header?.text}</div>}
        <div data-testid="grid-items">
          {items.map(item => (
            <div key={item.id} data-testid="grid-item" data-label={item.label?.text} data-icon={item.label?.icon}>
              {item.label?.text}
            </div>
          ))}
        </div>
      </div>
    )
  },
}))

describe('ProductCertificatesSection', () => {
  const mockHeader: ElementsHeaderEntry = {
    alignment: AlignmentEnum.CENTER,
    promoteHeaderIcon: false,
    header: {
      text: 'Certificates',
      ariaDescription: 'Product certificates',
      iconPosition: IconPositionEnum.BEFORE_TEXT,
      icon: 'verified',
    },
  }

  const mockCertificates: ApiProductCertificateProductCertificateDocument[] = [
    {
      documentId: 'cert-1',
      id: 1,
      certificateId: 'cert-1',
      publishedAt: '2025-01-01',
      certificate: {
        text: 'Organic',
        ariaDescription: 'Organic certified',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'eco',
      },
      seoMetadata: {},
    } as ApiProductCertificateProductCertificateDocument,
    {
      documentId: 'cert-2',
      id: 2,
      certificateId: 'cert-2',
      publishedAt: '2025-01-01',
      certificate: {
        text: 'Cruelty Free',
        ariaDescription: 'Cruelty free certified',
        iconPosition: IconPositionEnum.BEFORE_TEXT,
        icon: 'pets',
      },
      seoMetadata: {},
    } as ApiProductCertificateProductCertificateDocument,
  ]

  it('should render certificates in grid', () => {
    render(
      <ProductCertificatesSection direction={DirectionEnum.LTR} certificates={mockCertificates} header={mockHeader} />
    )

    const items = screen.getAllByTestId('grid-item')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Organic')
    expect(items[1]).toHaveTextContent('Cruelty Free')
  })

  it('should verify icon props passed to grid', () => {
    render(
      <ProductCertificatesSection direction={DirectionEnum.LTR} certificates={mockCertificates} header={mockHeader} />
    )

    const items = screen.getAllByTestId('grid-item')
    expect(items[0]).toHaveAttribute('data-icon', 'eco')
    expect(items[1]).toHaveAttribute('data-icon', 'pets')
  })

  it('should render header when provided', () => {
    render(
      <ProductCertificatesSection direction={DirectionEnum.LTR} certificates={mockCertificates} header={mockHeader} />
    )

    expect(screen.getByTestId('grid-header')).toHaveTextContent('Certificates')
  })

  it('should not render anything when certificates empty', () => {
    const { container } = render(
      <ProductCertificatesSection direction={DirectionEnum.LTR} certificates={[]} header={mockHeader} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('should fallback no icon when certificate icon is missing', () => {
    const mockCertificatesNoIcon: ApiProductCertificateProductCertificateDocument[] = [
      {
        ...mockCertificates[0]!,
        certificate: {
          ...mockCertificates[0]!.certificate,
          icon: undefined,
        },
      } as unknown as ApiProductCertificateProductCertificateDocument,
    ]

    render(
      <ProductCertificatesSection
        direction={DirectionEnum.LTR}
        certificates={mockCertificatesNoIcon}
        header={mockHeader}
      />
    )

    const items = screen.getAllByTestId('grid-item')
    expect(items[0]).not.toHaveAttribute('data-icon')
  })

  it('should handle certificate without a numeric id', () => {
    const certWithoutId = {
      ...mockCertificates[0],
      id: undefined,
    } as unknown as ApiProductCertificateProductCertificateDocument
    render(
      <ProductCertificatesSection direction={DirectionEnum.LTR} certificates={[certWithoutId]} header={mockHeader} />
    )
    const items = screen.getAllByTestId('grid-item')
    expect(items).toHaveLength(1)
  })
})
