// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { ShortcutsGrid } from '@/components/elements'
import {
  DirectionEnum,
  type ApiProductCertificateProductCertificateDocument,
  type ElementsHeaderEntry,
} from '@/lib/generated/types.gen'

/**
 * Props for the ProductCertificatesSection component
 */
export interface ProductCertificatesSectionProps {
  /** Certificates to display */
  certificates: ApiProductCertificateProductCertificateDocument[]
  /** Language direction for RTL support */
  direction: DirectionEnum
  /** Section header */
  header: ElementsHeaderEntry
}

/**
 * Section displaying product certificates using the ShortcutsGrid component.
 * @param props - Component props
 * @param props.certificates - Certificates to display
 * @param props.direction - Language direction
 * @param props.header - Section header
 * @returns Certificates section or null if no certificates
 */
export function ProductCertificatesSection({ certificates, direction, header }: ProductCertificatesSectionProps) {
  // Don't render if no certificates
  if (certificates.length === 0) {
    return null
  }

  const items = certificates.map(cert => ({
    id: typeof cert.id === 'number' ? cert.id : -1,
    url: '#',
    openInNewTab: false,
    label: cert.certificate,
  }))

  return (
    <ShortcutsGrid
      header={header}
      headerLevel={4}
      items={items}
      direction={direction}
      noAnimation={true}
      iconSize="6xl"
      buttonSize="lg"
    />
  )
}
