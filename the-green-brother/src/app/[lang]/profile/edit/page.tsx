// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { buildNoIndexMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import EditProfileClient from './EditProfileClient'

/**
 * Generate noindex metadata for the edit profile page.
 * @returns Metadata object with noindex robots directive
 */
export function generateMetadata(): Metadata {
  return buildNoIndexMetadata({
    title: 'Edit Profile',
  })
}

/**
 * Edit Profile page server component.
 * Renders the client-side edit profile form.
 * @returns Server component wrapping EditProfileClient
 */
export default function EditProfilePage() {
  return <EditProfileClient />
}
