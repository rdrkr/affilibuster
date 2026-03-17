// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { useEffect, type RefObject } from 'react'

/**
 * Hook to handle closing a dropdown/modal when scrolling outside of it.
 * @param isOpen - Whether the element is currently open
 * @param onClose - Function to call to close the element
 * @param refs - List of refs (container, toggle button, etc) that are considered "inside".
 *               Scrolling within these will NOT trigger close.
 */
export function useScrollToClose(isOpen: boolean, onClose: () => void, refs: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!isOpen) return

    const handleScroll = (event: Event) => {
      const target = event.target

      // Ensure target is a Node (window/document might trigger scroll but aren't Nodes that can be checked with contains)
      if (!(target instanceof Node)) {
        onClose()
        return
      }

      // If scroll happens inside any of the refs, ignore
      if (refs.some(ref => ref.current?.contains(target))) {
        return
      }
      onClose()
    }

    // Capture true is important to detect scroll events on elements that don't bubble
    window.addEventListener('scroll', handleScroll, { capture: true })
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [isOpen, onClose, refs])
}
