// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Footer Component
 * Reference: T116 (Footer component - multi-language aware)
 * Site footer with language-aware links
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Extract current language prefix
  const pathParts = pathname.split('/').filter(Boolean);
  const langPrefix =
    pathParts[0] === 'it' || pathParts[0] === 'he' || pathParts[0] === 'en' ? `/${pathParts[0]}` : '';

  const footerLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/contact', label: 'Contact' },
    { href: '/about', label: 'About Us' },
  ];

  return (
    <footer className="bg-primary-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8 text-secondary-400" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" rx="20" fill="currentColor"/>
                <text x="50" y="72" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="bold" fill="#5B21B6" textAnchor="middle">A</text>
              </svg>
              <h3 className="text-2xl font-bold">
                Affilibuster
              </h3>
            </div>
            <p className="text-neutral-300 mb-6 max-w-md">
              Multi-language affiliate platform helping you find the best
              products across languages and currencies. Shop with confidence
              in your preferred language.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-800 hover:bg-tertiary-600 p-3 rounded-lg transition-colors hover:text-primary-900"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-800 hover:bg-tertiary-600 p-3 rounded-lg transition-colors hover:text-primary-900"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`${langPrefix}${link.href}`}
                    className="text-neutral-300 hover:text-secondary-400 transition-colors flex items-center group"
                  >
                    <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Stay Updated
            </h3>
            <p className="text-neutral-300 text-sm mb-4">
              Get the latest product recommendations and updates
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-lg bg-primary-800 border border-primary-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-tertiary-400 transition-all"
              />
              <button className="bg-secondary-500 hover:bg-secondary-600 px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-400 text-sm">
            &copy; {currentYear} Affilibuster. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <span>Made with ❤️ for shoppers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
