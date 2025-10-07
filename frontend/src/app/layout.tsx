// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Root Layout (Minimal)
 * The actual layout with locale handling is in [lang]/layout.tsx
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affilibuster - Multi-Language Affiliate Platform',
  description:
    'Find the best products across languages and currencies. Compare prices, read reviews, and shop with confidence.',
  keywords: ['affiliate', 'products', 'multi-language', 'shopping'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
