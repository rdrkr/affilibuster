// Copyright (c) 2026 Affilibuster by Ronen Druker.

'use client'

import { TextBlock } from '@/components/elements'
import { PageClient } from '@/components/layout/PageClient'
import { useLayoutContext } from '@/components/providers'
import type { ApiCookiePolicyCookiePolicyDocument } from '@/lib/generated/types.gen'

/**
 * Props for CookiePolicyClient component
 */
export interface CookiePolicyClientProps {
  /** Cookie Policy data from CMS */
  data: ApiCookiePolicyCookiePolicyDocument | null
}

/**
 * Client component for the Cookie Policy page.
 * Renders the cookie policy content within a narrow layout.
 * @param props - Component props
 * @param props.data - Cookie Policy data from CMS
 * @returns Cookie Policy page content
 */
export default function CookiePolicyClient({ data }: CookiePolicyClientProps) {
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
