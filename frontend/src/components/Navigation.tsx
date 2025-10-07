// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Navigation Component
 * Reference: T115 (Navigation component - multi-language aware)
 * Main navigation bar with language-aware links
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencySelector } from './CurrencySelector';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
];

export function Navigation() {
  const pathname = usePathname();

  // Extract current language prefix
  const pathParts = pathname.split('/').filter(Boolean);
  const langPrefix =
    pathParts[0] === 'it' || pathParts[0] === 'he' ? `/${pathParts[0]}` : '';

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={langPrefix || '/'}
            className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Affilibuster
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const fullHref = `${langPrefix}${link.href}`;
              const isActive = pathname === fullHref;

              return (
                <Link
                  key={link.href}
                  href={fullHref}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Language & Currency Selectors */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <CurrencySelector />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
