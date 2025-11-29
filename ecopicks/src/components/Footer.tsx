// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Link from 'next/link'

const Footer = () => (
  <footer className="mt-20">
    <div className="border-t border-subtle-dark pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 29.3333C23.3638 29.3333 29.3333 23.3638 29.3333 16C29.3333 8.63619 23.3638 2.66666 16 2.66666C8.63619 2.66666 2.66666 8.63619 2.66666 16C2.66666 23.3638 8.63619 29.3333 16 29.3333Z"
                stroke="#14F195"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.166 10.6667C18.0478 12.396 16.3268 13.759 14.2858 14.5458C12.2449 15.3327 10.0118 15.4955 7.89932 14.9998C10.0118 17.8332 13.111 19.3332 16.4327 19.3332C19.7543 19.3332 22.8535 17.8332 24.966 14.9998C23.9538 13.6393 22.5857 12.5647 21.0163 11.8954C19.4469 11.2261 17.7423 10.993 16.0593 11.2222"
                stroke="#14F195"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-2xl font-bold text-white">EcoPicks</h1>
          </div>
          <p className="mt-4 text-text-secondary-dark text-sm">
            Your trusted source for curated sustainable products. Live consciously without compromise.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8 md:col-span-3">
          <div>
            <h5 className="font-bold text-text-main-dark mb-4">Shop</h5>
            <ul className="space-y-3 text-sm text-text-secondary-dark">
              <li>
                <Link href="/products" className="hover:text-text-main-dark transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-text-main-dark transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-text-main-dark transition-colors">
                  Fashion
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-text-main-dark transition-colors">
                  Beauty
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-text-main-dark transition-colors">
                  Tech
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-text-main-dark mb-4">About</h5>
            <ul className="space-y-3 text-sm text-text-secondary-dark">
              <li>
                <Link href="/about" className="hover:text-text-main-dark transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-text-main-dark transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-text-main-dark mb-4">Support</h5>
            <ul className="space-y-3 text-sm text-text-secondary-dark">
              <li>
                <Link href="/contact" className="hover:text-text-main-dark transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-text-main-dark transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-subtle-dark flex flex-col md:flex-row justify-between items-center text-sm text-text-secondary-dark px-4 sm:px-6 lg:px-8">
        <p>© 2026 EcoPicks. All Rights Reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="/terms" className="hover:text-text-main-dark transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-text-main-dark transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-text-main-dark transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
