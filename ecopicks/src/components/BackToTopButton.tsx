// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import { useEffect, useState } from 'react'

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
      className={`fixed bottom-6 right-6 bg-primary text-background-dark rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-primary-hover transition-all duration-500 transform z-40 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
      }`}
    >
      <span className="material-symbols-outlined font-bold">arrow_upward</span>
    </button>
  )
}

export default BackToTopButton
