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
import { useCallback, useEffect, useRef, useState } from 'react'

import { ButtonAction, ButtonLink, CMSIcon, CMSText } from '@/components/elements'
import { useScrollToClose } from '@/hooks/useScrollToClose'
import { DirectionEnum, IconPositionEnum, type MenusSearchMenuEntry } from '@/lib/generated/types.gen'
import { THRESHOLDS } from '@/lib/navigation'
import { Dropdown } from './DropdownMenu'
/**
 * Props for the SearchMenu component
 */
export interface SearchMenuProps {
  /** CMS data for the search menu */
  data: MenusSearchMenuEntry
  /** Callback when search expands or collapses */
  onExpandChange?: (expanded: boolean) => void
  /** Whether to show the text label (for responsive collapse). Defaults to true. */
  showText?: boolean
  /** Text direction for RTL support */
  direction: DirectionEnum
  /** Current navigation width */
  navWidth: number
}

/**
 * Expandable search menu with dropdown for suggestions
 * @param props - Component props with CMS data
 * @param props.data - CMS data for the search menu
 * @param props.onExpandChange - Callback when search expands or collapses
 * @param props.showText - Whether to show the text label
 * @param props.direction - Text direction for RTL support
 * @param props.navWidth - Current navigation width
 * @returns Search menu component
 */
export function SearchMenu({ data, onExpandChange, showText, direction, navWidth }: SearchMenuProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [buttonWidth, setButtonWidth] = useState<number | null>(null)
  const isRTL = direction === DirectionEnum.RTL

  // Consolidate closing logic to ensure parent is always notified
  const safeCloseSearch = useCallback(() => {
    setShowDropdown(false)
    // Wait for dropdown fade out
    setTimeout(() => {
      setIsSearchOpen(false)
      // Wait for width transition to finish before notifying parent
      // This ensures the other elements don't pop in before there is space
      setTimeout(() => {
        onExpandChange?.(false)
      }, 300)
    }, 300)
  }, [onExpandChange])

  useScrollToClose(showDropdown, () => {
    safeCloseSearch()
  }, [searchRef])

  // Measure button width when closed
  useEffect(() => {
    if (!buttonRef.current || isSearchOpen) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === buttonRef.current) {
          setButtonWidth((entry.target as HTMLElement).offsetWidth)
        }
      }
    })

    resizeObserver.observe(buttonRef.current)

    // Initial measure
    setButtonWidth(buttonRef.current.offsetWidth)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isSearchOpen, showText, direction, data.menuButton])

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        // Only close if currently open to avoid redundant calls
        if (isSearchOpen) {
          safeCloseSearch()
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen, safeCloseSearch])

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
  // Lock to prevent mouse leave during expansion transition
  // This fixes race condition where layout changes trigger synthetic mouse leave events
  const isExpandingRef = useRef(false)
  const expandLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Handle mouse enter on search component
   */
  const handleSearchMouseEnter = () => {
    // Set expansion lock - ignore mouse leaves during transition
    isExpandingRef.current = true

    // Clear any pending unlock timeout
    if (expandLockTimeoutRef.current) {
      clearTimeout(expandLockTimeoutRef.current)
    }

    // Notify parent FIRST to make space
    onExpandChange?.(true)

    // Small delay to allow StartNav to begin shrinking before we expand
    setTimeout(() => {
      setIsSearchOpen(true)
      setTimeout(() => {
        setShowDropdown(true)
        // Unlock after dropdown is shown and layout has settled
        expandLockTimeoutRef.current = setTimeout(() => {
          isExpandingRef.current = false
        }, 100)
      }, 300)
    }, 100)
  }

  /**
   * Handle mouse leave on search component
   */
  const handleSearchMouseLeave = () => {
    // Ignore mouse leave during expansion transition (prevents race condition)
    if (isExpandingRef.current) {
      return
    }

    if (!searchQuery) {
      safeCloseSearch()
    }
  }

  return (
    <div
      ref={searchRef}
      className={`
        group relative flex items-center transition-all duration-300 ease-out
        ${isSearchOpen ? 'sm:w-76! md:w-86!' : ''}
      `}
      style={{
        width: isSearchOpen
          ? window.innerWidth < THRESHOLDS.SEARCH_ONLY
            ? `${String(navWidth - 18)}px`
            : ''
          : buttonWidth
            ? `${String(buttonWidth)}px`
            : undefined,
      }}
      onMouseEnter={handleSearchMouseEnter}
      onMouseLeave={handleSearchMouseLeave}
    >
      {/* Search Button - shown when closed */}
      {!isSearchOpen && (
        <ButtonAction
          ref={buttonRef}
          data={data.menuButton}
          direction={direction}
          showText={showText === true}
          className="shrink-0"
          onClick={() => {
            setIsSearchOpen(true)
          }}
          variant="ghost-1"
          iconSize="md"
          size="sm"
          aria-expanded={isSearchOpen}
        />
      )}

      {/* Search Input Container - shown when open */}
      {isSearchOpen && (
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          className={`
            flex min-h-11.5 w-full items-center gap-1 overflow-hidden rounded-full
            border border-neutral-200 bg-white/60 px-4 ring-1 ring-primary/50
            transition-all duration-300
            dark:border-white/20 dark:bg-surface-dark/60
          `}
        >
          <span className="material-symbols-outlined shrink-0 text-xl text-primary">
            <CMSIcon icon={data.menuButton.label?.icon ?? 'search'} size="md" />
          </span>

          <input
            ref={inputRef}
            dir={isRTL ? 'rtl' : 'ltr'}
            type="text"
            className={`
              size-full border-none bg-transparent p-0 ${isRTL ? 'text-right' : 'text-left'} text-sm
              leading-none text-neutral-800 placeholder-neutral-400 outline-none
              focus:ring-0 dark:text-white dark:placeholder-text-secondary-dark
            `}
            placeholder={data.textBoxPlaceholderLabel.text}
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
            }}
            onBlur={() => {
              setTimeout(() => {
                if (!searchQuery && searchRef.current && !searchRef.current.matches(':hover')) {
                  safeCloseSearch()
                }
              }, 200)
            }}
          />

          {/* Close Button */}
          <button
            onClick={e => {
              e.stopPropagation()
              safeCloseSearch()
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
        </div>
      )}

      {/* Search Dropdown */}
      <Dropdown align="end" direction={direction} isVisible={isSearchOpen && showDropdown} width="350px">
        {!searchQuery ? (
          <div className="space-y-6 p-4">
            <div className="animate-fade-in">
              <h4
                className={`
                mb-3 text-xs font-bold tracking-wider text-neutral-500
                uppercase dark:text-text-secondary-dark
              `}
              >
                <CMSText text={data.recentSearchesLabel.text} />
              </h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(term => (
                  <ButtonAction
                    key={term}
                    data={{
                      label: { text: term, iconPosition: IconPositionEnum.BEFORE_TEXT, ariaDescription: term },
                      url: '',
                      openInNewTab: false,
                    }}
                    direction={DirectionEnum.LTR}
                    showText={true}
                    variant="ghost-3"
                    iconSize="sm"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(term)
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h4
                className={`
                  mb-3 flex items-center gap-1 text-xs font-bold
                  tracking-wider text-neutral-500 uppercase dark:text-text-secondary-dark
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
                      direction={direction}
                      showText={true}
                      variant="ghost-2"
                      size="sm"
                      className={`group gap-3 p-2`}
                      onClick={() => {
                        setSearchQuery(term)
                      }}
                    >
                      <span
                        className={`
                        material-symbols-outlined text-neutral-500
                        group-hover:text-primary group-hover:text-shadow-sm
                        dark:text-text-secondary-dark dark:group-hover:text-shadow-none
                      `}
                      >
                        arrow_outward
                      </span>
                      <span className="text-base font-normal text-neutral-700 dark:text-white">{term}</span>
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
              text-neutral-500 uppercase dark:text-text-secondary-dark
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
                      hover:bg-neutral-100 dark:hover:bg-white/5
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
                      <p className="text-sm font-medium text-neutral-800 dark:text-white">{result.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-text-secondary-dark">{result.category}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <ButtonLink
              data={{ ...data.viewAllResultsButton, url: '/products' }}
              direction={direction}
              showText={true}
              variant="link-1"
              iconSize="sm"
              size="sm"
              className={`mt-2 block truncate p-2`}
              noAnimation
            >
              &quot;{searchQuery.length > 8 ? searchQuery.slice(0, 8) + '...' : searchQuery}&quot;
            </ButtonLink>
          </div>
        )}
      </Dropdown>
    </div>
  )
}

export default SearchMenu
