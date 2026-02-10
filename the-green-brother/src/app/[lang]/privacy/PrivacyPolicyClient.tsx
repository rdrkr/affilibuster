// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

import { TextBlock } from '@/components/elements'
import { PageClient } from '@/components/layout/PageClient'
import { useLayoutContext } from '@/components/providers'
import type { ApiPrivacyPrivacyDocument } from '@/lib/generated/types.gen'

/**
 * Props for PrivacyPolicyClient component
 */
export interface PrivacyPolicyClientProps {
  /** Privacy Policy data from CMS */
  data: ApiPrivacyPrivacyDocument | null
}

/**
 * Client component for the Privacy Policy page.
 * Renders the privacy policy content within a narrow layout.
 * @param props - Component props
 * @param props.data - Privacy Policy data from CMS
 * @returns Privacy Policy page content
 */
export default function PrivacyPolicyClient({ data }: PrivacyPolicyClientProps) {
  const { direction } = useLayoutContext()

  if (!data?.content) {
    return null
  }

  return (
    <PageClient layout="narrow" breadcrumbs={{ customLastCrumbLabel: data.content.header?.header?.text ?? '' }}>
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
