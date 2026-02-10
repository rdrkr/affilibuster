// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import { useEffect, useState } from 'react'

import { Icon } from '@/components/elements'
import { DirectionEnum } from '@/lib/generated/types.gen'

interface BackToTopButtonProps {
  direction?: DirectionEnum
}

/**
 * Back to top button component.
 * Appears when user scrolls down and smoothly scrolls to top on click.
 * @param props - Component props
 * @param props.direction - Language direction (ltr/rtl)
 * @returns BackToTopButton component
 */
const BackToTopButton = ({ direction = DirectionEnum.LTR }: BackToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const isRTL = direction === DirectionEnum.RTL

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
        fixed ${isRTL ? 'left-6' : 'right-6'} bottom-6 z-40 flex size-12 transform items-center
        justify-center rounded-full bg-primary text-background-dark shadow-lg
        transition-all duration-500
        hover:bg-primary-hover active:bg-primary-800
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
