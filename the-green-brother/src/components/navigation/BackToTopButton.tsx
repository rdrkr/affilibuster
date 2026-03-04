// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import { useEffect, useState } from 'react'

import { Icon } from '@/components/elements'

/**
 * Back to top button component.
 * Appears when user scrolls down and smoothly scrolls to top on click.
 * Position adapts to text direction via CSS logical property (end-6).
 * @returns BackToTopButton component
 */
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed inset-e-6 bottom-6 z-40 flex size-12 transform items-center
        justify-center rounded-full bg-primary text-foreground shadow-lg
        transition-all duration-500
        hover:bg-primary-hover active:bg-primary-active
        ${
          isVisible
            ? 'translate-y-0 scale-100 opacity-100'
            : `
          pointer-events-none translate-y-10 scale-90 opacity-0
        `
        }
      `}
    >
      <Icon icon="arrow_upward" size="lg" />
    </button>
  )
}

export default BackToTopButton
