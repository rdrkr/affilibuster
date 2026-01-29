// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

import { TextBlock } from '@/components/elements'
import { PageClient } from '@/components/layout/PageClient'
import { useLayoutContext } from '@/components/providers'
import type { ApiTermTermDocument } from '@/lib/generated/types.gen'

/**
 * Props for TermsOfServiceClient component
 */
export interface TermsOfServiceClientProps {
  /** Terms of Service data from CMS */
  data: ApiTermTermDocument | null
}

/**
 * Client component for the Terms of Service page.
 * Renders the terms of service content within a narrow layout.
 * @param props - Component props
 * @param props.data - Terms of Service data from CMS
 * @returns Terms of Service page content
 */
export default function TermsOfServiceClient({ data }: TermsOfServiceClientProps) {
  const { direction } = useLayoutContext()

  if (!data?.content) {
    return null
  }

  return (
    <PageClient
      layout="narrow"
      breadcrumbs={{ customLastCrumbLabel: data.content.header?.header?.text ?? 'Terms of Service' }}
    >
      <TextBlock
        data={{
          ...data.content,
          __component: 'elements.text-block',
        }}
        direction={direction}
        headerLevel={1}
      />
    </PageClient>
  )
}
