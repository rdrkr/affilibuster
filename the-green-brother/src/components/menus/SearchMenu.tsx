// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Search Menu Component
 *
 * Expandable search input with recent/trending search suggestions.
 * All labels and text content come from CMS via MenusSearchMenuEntry.
 */

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { ButtonAction, ButtonLink, CMSIcon, CMSText } from '@/components/elements'
import { DirectionEnum, type MenusSearchMenuEntry } from '@/lib/generated/types.gen'
import { DropdownMenu } from './DropdownMenu'

/**
 * Props for the SearchMenu component
 */
export interface SearchMenuProps {
  /** CMS data for the search menu */
  data: MenusSearchMenuEntry
}

/**
 * Expandable search menu with dropdown for suggestions
 * @param props - Component props with CMS data
 * @param props.data - CMS data for the search menu
 * @returns Search menu component
 */
export function SearchMenu({ data }: SearchMenuProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle click outside to close search
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

  // TODO: Replace with actual data from search API
  const recentSearches = ['Bamboo Toothbrush', 'Reusable Bags', 'Compost Bin']
  const trendingSearches = ['Solar Chargers', 'Beeswax Wraps', 'Metal Straws']
  const searchResults = [
    {
      name: 'Bamboo Coffee Cup',
      category: 'Kitchen',
      image: '/images/product-bamboo-cup.webp',
    },
    {
      name: 'Organic Produce Bags',
      category: 'Home',
      image: '/images/product-produce-bags.webp',
    },
    {
      name: 'Solid Shampoo Bar',
      category: 'Beauty',
      image: '/images/product-shampoo-bar.webp',
    },
  ]

  /**
   * Handle mouse enter on search component
   */
  const handleSearchMouseEnter = () => {
    setIsSearchOpen(true)
    setTimeout(() => {
      setShowDropdown(true)
    }, 300)
  }

  /**
   * Handle mouse leave on search component
   */
  const handleSearchMouseLeave = () => {
    if (!searchQuery) {
      setShowDropdown(false)
      setTimeout(() => {
        setIsSearchOpen(false)
      }, 300)
    }
  }

  return (
    <div
      ref={searchRef}
      className={`
        relative h-10 transition-all duration-300 ease-out
        ${
          isSearchOpen
            ? `
          w-[200px]
          md:w-64
        `
            : `
          w-10
          lg:w-24
        `
        }
      `}
      onMouseEnter={handleSearchMouseEnter}
      onMouseLeave={handleSearchMouseLeave}
    >
      <div
        dir="ltr"
        className={`
          flex h-full w-full items-center gap-1 overflow-hidden rounded-full
          transition-all duration-300
          ${
            isSearchOpen
              ? `
              justify-start border border-white/20 bg-surface-dark px-4 ring-1
              ring-primary/50
            `
              : `
              cursor-pointer justify-center px-2
              hover:bg-surface-dark hover:text-white
              lg:justify-start lg:px-3
            `
          }
        `}
        onClick={() => {
          setIsSearchOpen(true)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsSearchOpen(true)
          }
        }}
        aria-label={data.menuButton.label?.ariaDescription}
      >
        <span
          className={`
          material-symbols-outlined shrink-0 text-xl
          ${isSearchOpen ? `text-primary` : ''}
        `}
        >
          <CMSIcon icon={data.menuButton.label?.icon ?? 'search'} size="md" />
        </span>

        {/* Text Label: Visible only when closed */}
        <span
          className={`
            whitespace-nowrap transition-opacity duration-200
            ${
              isSearchOpen
                ? 'hidden'
                : `
              hidden opacity-100
              lg:inline
            `
            }
          `}
        >
          <CMSText text={data.menuButton.label?.text} />
        </span>

        {/* Input: Visible only when open */}
        <input
          ref={inputRef}
          dir="ltr"
          type="text"
          className={`
            h-full w-full border-none bg-transparent p-0 text-left text-sm
            leading-none text-white placeholder-text-secondary-dark outline-none
            focus:ring-0
            ${isSearchOpen ? `block` : `hidden`}
          `}
          placeholder={data.textBoxPlaceholderLabel.text}
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
          }}
          onBlur={() => {
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
            className={`
              flex shrink-0
              hover:text-white
            `}
            aria-label="Close search"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      <DropdownMenu
        isVisible={isSearchOpen && showDropdown}
        align="right"
        className={`
          right-0 left-auto origin-top transform pt-3
          md:left-0
          ${isSearchOpen && showDropdown ? 'translate-y-0' : '-translate-y-4'}
          w-[calc(100vw-2rem)] md:w-full
        `}
        contentClassName="shadow-2xl"
      >
        {!searchQuery ? (
          <div className="space-y-6 p-4">
            <div className="animate-fade-in">
              <h4
                className={`
                mb-3 text-xs font-bold tracking-wider text-text-secondary-dark
                uppercase
              `}
              >
                <CMSText text={data.recentSearchesLabel.text} />
              </h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(term => (
                  <ButtonAction
                    key={term}
                    direction={DirectionEnum.LTR}
                    variant="ghost"
                    className={`
                      rounded-xl bg-white/5 px-3 py-1.5 text-sm text-white
                      transition-colors
                      hover:bg-white/10
                    `}
                    onClick={() => {
                      setSearchQuery(term)
                    }}
                  >
                    {term}
                  </ButtonAction>
                ))}
              </div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h4
                className={`
                  mb-3 flex items-center gap-1 text-xs font-bold
                  tracking-wider text-text-secondary-dark uppercase
                `}
              >
                <span
                  className={`
                  material-symbols-outlined text-sm text-primary
                `}
                >
                  <CMSIcon icon={data.nowTrendingLabel.icon} size="sm" />
                </span>
                <CMSText text={data.nowTrendingLabel.text} />
              </h4>
              <ul className="space-y-2">
                {trendingSearches.map(term => (
                  <li key={term}>
                    <ButtonAction
                      direction={DirectionEnum.LTR}
                      variant="ghost"
                      className={`
                        group flex w-full items-center justify-start gap-3 rounded-xl p-2
                        transition-colors
                        hover:bg-white/5
                      `}
                      onClick={() => {
                        setSearchQuery(term)
                      }}
                    >
                      <span
                        className={`
                        material-symbols-outlined text-text-secondary-dark
                        group-hover:text-primary
                      `}
                      >
                        arrow_outward
                      </span>
                      <span className="text-base font-normal text-white">{term}</span>
                    </ButtonAction>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <h4
              className={`
              px-4 py-2 text-xs font-bold tracking-wider
              text-text-secondary-dark uppercase
            `}
            >
              Products
            </h4>
            <ul>
              {searchResults.map((result, idx) => (
                <li key={idx} className="animate-fade-in" style={{ animationDelay: `${String(idx * 0.05)}s` }}>
                  <Link
                    href="/products"
                    className={`
                      flex items-center gap-4 px-4 py-3 transition-colors
                      hover:bg-white/5
                    `}
                  >
                    <Image
                      src={result.image}
                      alt={result.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{result.name}</p>
                      <p className="text-xs text-text-secondary-dark">{result.category}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink
              data={data.viewAllResultsButton}
              href="/products"
              direction={DirectionEnum.LTR}
              variant="ghost"
              className={`
                mt-2 block w-full truncate border-t border-white/5 px-4 py-3
                text-center text-sm font-bold text-primary
                hover:bg-white/5
              `}
            >
              <CMSText text={data.viewAllResultsButton.label?.text} /> &quot;{searchQuery}&quot;
            </ButtonLink>
          </div>
        )}
      </DropdownMenu>
    </div>
  )
}

export default SearchMenu
