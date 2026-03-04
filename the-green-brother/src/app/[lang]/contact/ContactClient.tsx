// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import { PageClient } from '@/components/layout'
import type { ApiContactUsContactUsDocument } from '@/lib/generated/types.gen'

interface ContactClientProps {
  contactData: ApiContactUsContactUsDocument | null
}

/**
 * Client component for contact page.
 *
 * Renders contact page content with form from CMS data.
 * @param props - Component properties
 * @param props.contactData - Contact page data from CMS
 * @returns Contact page UI
 */
export default function ContactClient({ contactData }: ContactClientProps) {
  return (
    <PageClient className="py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">{contactData?.title ?? 'Contact & Support'}</h1>
          {contactData?.subtitle && <p className="text-lg text-muted-foreground">{contactData.subtitle}</p>}
        </div>

        {/* Contact form labels and fields would be rendered here using CMS data */}
        <div className="prose max-w-none text-muted-foreground dark:prose-invert">
          <p className="text-center text-muted-foreground">Contact form with CMS labels</p>
        </div>
      </div>
    </PageClient>
  )
}
