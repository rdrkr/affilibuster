// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Root Products Page - Redirects to default locale
 */

import { redirect } from 'next/navigation';

export default function ProductsRedirect() {
  // Redirect to default locale products page
  redirect('/en/products');
}
