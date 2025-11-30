// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

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
    <div className="py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">{contactData?.title ?? 'Contact & Support'}</h1>
          {contactData?.subtitle && <p className="text-lg text-tertiary-300">{contactData.subtitle}</p>}
        </div>

        {/* Contact form labels and fields would be rendered here using CMS data */}
        <div className="prose prose-invert max-w-none text-tertiary-300">
          <p className="text-center text-tertiary-400">Contact form with CMS labels</p>
        </div>
      </div>
    </div>
  )
}
