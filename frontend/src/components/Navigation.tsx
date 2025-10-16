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
import { ThemeSelector } from './ThemeSelector';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navigation() {
  const pathname = usePathname();

  // Extract current language prefix
  const pathParts = pathname.split('/').filter(Boolean);
  const langPrefix =
    pathParts[0] === 'it' || pathParts[0] === 'he' || pathParts[0] === 'en' ? `/${pathParts[0]}` : '';

  return (
    <nav className="bg-primary-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={langPrefix || '/'}
            className="text-2xl font-bold text-white hover:text-secondary-400 transition-colors flex items-center gap-2"
          >
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="20" fill="currentColor"/>
              <text x="50" y="72" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="bold" fill="#5B21B6" textAnchor="middle">A</text>
            </svg>
            Affilibuster
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const fullHref = `${langPrefix}${link.href}`;
              const isActive = pathname === fullHref;

              return (
                <Link
                  key={link.href}
                  href={fullHref}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-b-2 ${
                    isActive
                      ? 'bg-primary-700 text-white border-tertiary-400'
                      : 'text-neutral-200 hover:bg-primary-700 hover:text-white border-b-2 border-transparent hover:border-tertiary-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Language, Currency & Theme Selectors */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <CurrencySelector />
            <ThemeSelector />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-white hover:bg-primary-700"
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
