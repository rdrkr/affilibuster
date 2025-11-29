// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('En')
  const [selectedTheme, setSelectedTheme] = useState('System')

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const pathname = usePathname()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle click outside to close search if it was kept open by focus/content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Auto-focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])

  const isActive = (path: string) => {
    // Handle /en locale for home page
    if (path === '/' && (pathname === '/en' || pathname === '/')) return true
    if (path === '/' && pathname !== '/' && pathname !== '/en') return false
    return pathname.startsWith(path)
  }

  const productCategories = [
    {
      name: 'Home Goods',
      image: '/images/category-home.jpg',
    },
    {
      name: 'Fashion',
      image: '/images/category-fashion.jpg',
    },
    {
      name: 'Beauty',
      image: '/images/category-beauty.jpg',
    },
    {
      name: 'Tech',
      image: '/images/category-tech.jpg',
    },
  ]

  const languages = [
    { name: 'English', flag: '🇬🇧', code: 'En' },
    { name: 'Italian', flag: '🇮🇹', code: 'It' },
    { name: 'עברית', flag: '🇮🇱', code: 'עב' },
  ]

  const themes = [
    { name: 'System', icon: 'desktop_windows' },
    { name: 'Light', icon: 'light_mode' },
    { name: 'Dark', icon: 'dark_mode' },
  ]

  // Mock Data for Search
  const recentSearches = ['Bamboo Toothbrush', 'Reusable Bags', 'Compost Bin']
  const trendingSearches = ['Solar Chargers', 'Beeswax Wraps', 'Metal Straws']
  const searchResults = [
    {
      name: 'Bamboo Coffee Cup',
      category: 'Kitchen',
      image: '/images/product-bamboo-cup.jpg',
    },
    {
      name: 'Organic Produce Bags',
      category: 'Home',
      image: '/images/product-produce-bags.jpg',
    },
    {
      name: 'Solid Shampoo Bar',
      category: 'Beauty',
      image: '/images/product-shampoo-bar.jpg',
    },
  ]

  const handleSearchMouseEnter = () => {
    setIsSearchOpen(true)
    // Delay showing dropdown to match transition
    setTimeout(() => {
      setShowDropdown(true)
    }, 300)
  }

  const handleSearchMouseLeave = () => {
    // Only close if query is empty
    if (!searchQuery) {
      setShowDropdown(false)
      // Delay closing search to allow dropdown to fade out
      setTimeout(() => {
        setIsSearchOpen(false)
      }, 300)
    }
  }

  return (
    <div className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 py-4">
      <nav className="rounded-full bg-surface-dark/90 backdrop-blur-lg border border-white/10 p-2 md:p-3 lg:px-6 shadow-lg relative">
        <div className="flex justify-between items-center relative z-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:scale-110 transition-transform"
              >
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
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight hidden lg:block">EcoPicks</h1>
            </Link>
            <div className="hidden md:flex justify-center items-center gap-6 text-sm font-semibold text-text-secondary-dark relative">
              <Link href="/" className={`transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : ''}`}>
                Home
              </Link>

              {/* Products Dropdown */}
              <div className="group h-full flex items-center">
                <Link
                  href="/products"
                  className={`transition-colors hover:text-primary flex items-center gap-1 ${
                    isActive('/products') ? 'text-primary' : ''
                  }`}
                >
                  Products
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:rotate-180">
                    expand_more
                  </span>
                </Link>
                <div className="absolute top-full left-0 w-[500px] pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform -translate-x-1/4">
                  <div className="bg-surface-dark border border-white/10 rounded-3xl shadow-xl p-4 grid grid-cols-2 gap-4">
                    {productCategories.map(category => (
                      <Link
                        key={category.name}
                        href="/products"
                        className="block group/item relative overflow-hidden rounded-xl h-32"
                      >
                        <Image
                          src={category.image}
                          alt={category.name}
                          className="object-cover transition-transform duration-500 group-hover/item:scale-110"
                          fill
                          sizes="250px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                          <span className="text-white font-bold group-hover/item:text-primary transition-colors">
                            {category.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/blog"
                className={`transition-colors hover:text-primary ${isActive('/blog') ? 'text-primary' : ''}`}
              >
                Blog
              </Link>
              <Link
                href="/about"
                className={`transition-colors hover:text-primary ${isActive('/about') ? 'text-primary' : ''}`}
              >
                About
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-sm font-medium text-text-secondary-dark">
            {/* Search Component */}
            <div
              ref={searchRef}
              className={`relative h-10 transition-all duration-300 ease-out ${
                isSearchOpen ? 'w-[200px] md:w-64' : 'w-10 lg:w-24'
              }`}
              onMouseEnter={handleSearchMouseEnter}
              onMouseLeave={handleSearchMouseLeave}
            >
              <div
                dir="ltr"
                className={`flex items-center gap-1 rounded-full h-full w-full overflow-hidden transition-all duration-300 ${
                  isSearchOpen
                    ? 'bg-surface-dark px-4 border border-white/20 ring-1 ring-primary/50 justify-start'
                    : 'hover:bg-surface-dark hover:text-white px-2 lg:px-3 cursor-pointer justify-center lg:justify-start'
                }`}
                onClick={() => {
                  setIsSearchOpen(true)
                }}
              >
                <span className={`material-symbols-outlined text-xl shrink-0 ${isSearchOpen ? 'text-primary' : ''}`}>
                  search
                </span>

                {/* Text Label: Visible only when closed */}
                <span
                  className={`whitespace-nowrap transition-opacity duration-200 ${
                    isSearchOpen ? 'hidden' : 'hidden lg:inline opacity-100'
                  }`}
                >
                  Search
                </span>

                {/* Input: Visible only when open */}
                <input
                  ref={inputRef}
                  dir="ltr"
                  type="text"
                  className={`bg-transparent border-none outline-none focus:ring-0 text-white placeholder-text-secondary-dark w-full text-sm p-0 h-full leading-none text-left ${
                    isSearchOpen ? 'block' : 'hidden'
                  }`}
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                  }}
                  onBlur={() => {
                    // Close if mouse is not over component and query is empty
                    // We need a slight delay to allow click events on results to fire before closing
                    setTimeout(() => {
                      if (!searchQuery && searchRef.current && !searchRef.current.matches(':hover')) {
                        setShowDropdown(false)
                        setTimeout(() => {
                          setIsSearchOpen(false)
                        }, 300)
                      }
                    }, 200)
                  }}
                />

                {/* Close Button */}
                {isSearchOpen && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setShowDropdown(false)
                      setTimeout(() => {
                        setIsSearchOpen(false)
                      }, 300)
                      setSearchQuery('')
                    }}
                    className="hover:text-white shrink-0 flex"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>

              {/* Search Dropdown */}
              <div
                className={`absolute top-full right-0 left-auto md:left-0 pt-3 w-[calc(100vw-2rem)] md:w-full z-50 transition-all duration-300 origin-top transform ${
                  isSearchOpen && showDropdown
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-4'
                }`}
              >
                <div className="bg-surface-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                  {!searchQuery ? (
                    <div className="p-4 space-y-6">
                      <div className="animate-fade-in">
                        <h4 className="text-xs font-bold text-text-secondary-dark uppercase tracking-wider mb-3">
                          Recent Searches
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map(term => (
                            <button
                              key={term}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
                              onClick={() => {
                                setSearchQuery(term)
                              }}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <h4 className="text-xs font-bold text-text-secondary-dark uppercase tracking-wider mb-3 flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-sm">trending_up</span> Now
                          Trending
                        </h4>
                        <ul className="space-y-2">
                          {trendingSearches.map(term => (
                            <li key={term}>
                              <button
                                className="flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-lg group transition-colors"
                                onClick={() => {
                                  setSearchQuery(term)
                                }}
                              >
                                <span className="material-symbols-outlined text-text-secondary-dark group-hover:text-primary">
                                  arrow_outward
                                </span>
                                <span className="text-white">{term}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <h4 className="text-xs font-bold text-text-secondary-dark uppercase tracking-wider px-4 py-2">
                        Products
                      </h4>
                      <ul>
                        {searchResults.map((result, idx) => (
                          <li
                            key={idx}
                            className="animate-fade-in"
                            style={{ animationDelay: `${String(idx * 0.05)}s` }}
                          >
                            <Link
                              href="/products"
                              className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors"
                            >
                              <Image
                                src={result.image}
                                alt={result.name}
                                width={40}
                                height={40}
                                className="rounded-md object-cover"
                              />
                              <div>
                                <p className="text-white font-medium text-sm">{result.name}</p>
                                <p className="text-xs text-text-secondary-dark">{result.category}</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/products"
                        className="block text-center py-3 text-sm text-primary font-bold hover:bg-white/5 border-t border-white/5 mt-2 truncate px-4"
                      >
                        View all results for &quot;{searchQuery}&quot;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Theme Dropdown */}
            <div className="group relative h-full flex items-center">
              <button className="hidden lg:flex items-center gap-1.5 p-2 rounded-full group-hover:bg-surface-dark group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">desktop_windows</span>
                <span className="hidden lg:inline">Theme</span>
                <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:rotate-180">
                  expand_more
                </span>
              </button>

              <div className="absolute top-full right-0 w-40 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="bg-surface-dark border border-white/10 rounded-3xl shadow-xl overflow-hidden p-1.5">
                  {themes.map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => {
                        setSelectedTheme(theme.name)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 text-white rounded-xl transition-colors flex items-center gap-3 ${
                        selectedTheme === theme.name ? 'bg-white/5' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{theme.icon}</span>
                      <span className="font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Language Dropdown */}
            <div className="group relative h-full flex items-center">
              <button className="flex items-center gap-2 px-3 py-2 rounded-full group-hover:bg-surface-dark group-hover:text-white transition-colors relative">
                <div className="relative">
                  <span className="material-symbols-outlined text-xl">language</span>
                  <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-black px-0.5 rounded-sm leading-none flex items-center justify-center min-w-[14px]">
                    {selectedLang}
                  </span>
                </div>
                <span className="hidden lg:inline">Language</span>
                <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:rotate-180">
                  expand_more
                </span>
              </button>

              <div className="absolute top-full right-0 w-48 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="bg-surface-dark border border-white/10 rounded-3xl shadow-xl overflow-hidden p-1.5">
                  {languages.map(lang => (
                    <button
                      key={lang.name}
                      onClick={() => {
                        setSelectedLang(lang.code)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 text-white rounded-xl transition-colors flex items-center gap-3 ${
                        selectedLang === lang.code ? 'bg-white/5' : ''
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 bg-primary text-background-dark px-5 py-2 rounded-full font-bold hover:bg-primary-hover transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-xl">account_circle</span>
              <span>Login</span>
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen)
              }}
              className="p-2 rounded-full hover:bg-surface-dark hover:text-white transition-colors md:hidden shrink-0"
            >
              <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100 mt-4 pt-4 border-t border-white/10' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-4 text-center pb-2">
            <Link
              href="/"
              onClick={() => {
                setIsMenuOpen(false)
              }}
              className={`text-lg font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-text-secondary-dark'
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => {
                setIsMenuOpen(false)
              }}
              className={`text-lg font-medium transition-colors hover:text-primary ${
                isActive('/products') ? 'text-primary' : 'text-text-secondary-dark'
              }`}
            >
              Products
            </Link>
            <Link
              href="/blog"
              onClick={() => {
                setIsMenuOpen(false)
              }}
              className={`text-lg font-medium transition-colors hover:text-primary ${
                isActive('/blog') ? 'text-primary' : 'text-text-secondary-dark'
              }`}
            >
              Blog
            </Link>
            <Link
              href="/about"
              onClick={() => {
                setIsMenuOpen(false)
              }}
              className={`text-lg font-medium transition-colors hover:text-primary ${
                isActive('/about') ? 'text-primary' : 'text-text-secondary-dark'
              }`}
            >
              About
            </Link>
            <div className="flex justify-center gap-4 mt-2">
              <Link
                href="/login"
                onClick={() => {
                  setIsMenuOpen(false)
                }}
                className="flex items-center gap-2 bg-primary text-background-dark px-6 py-2 rounded-full font-bold hover:bg-primary-hover transition-colors"
              >
                <span className="material-symbols-outlined text-xl">account_circle</span>
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
