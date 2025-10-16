// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * 410 Gone page
 * Reference: T145 (URL redirect handling - 410 status)
 * Displayed when a URL is permanently removed
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '410 - Page Gone',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GonePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-2">410</h1>
          <h2 className="text-2xl font-semibold text-neutral-700 mb-4">
            Page Gone
          </h2>
          <p className="text-neutral-600 mb-8">
            This page has been permanently removed and is no longer available.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-secondary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary-700 transition-colors"
          >
            Go to Homepage
          </Link>

          <p className="text-sm text-neutral-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
