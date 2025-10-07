// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Root About Page - Redirects to default locale
 */

import { redirect } from 'next/navigation';

export default function AboutRedirect() {
  // Redirect to default locale about page
  redirect('/en/about');
}
