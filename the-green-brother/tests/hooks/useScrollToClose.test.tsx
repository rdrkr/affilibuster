// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { useScrollToClose } from '@/hooks/useScrollToClose'
import { renderHook } from '@testing-library/react'

describe('useScrollToClose', () => {
  let addEventListenerSpy: jest.SpyInstance
  let removeEventListenerSpy: jest.SpyInstance

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should add scroll listener when open', () => {
    const onClose = jest.fn()
    const refs = [{ current: document.createElement('div') }]

    renderHook(() => {
      useScrollToClose(true, onClose, refs)
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { capture: true })
  })

  it('should remove scroll listener when unmounted', () => {
    const onClose = jest.fn()
    const refs = [{ current: document.createElement('div') }]

    const { unmount } = renderHook(() => {
      useScrollToClose(true, onClose, refs)
    })

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { capture: true })
  })

  it('should not add listener when closed', () => {
    const onClose = jest.fn()
    const refs = [{ current: document.createElement('div') }]

    renderHook(() => {
      useScrollToClose(false, onClose, refs)
    })

    expect(addEventListenerSpy).not.toHaveBeenCalled()
  })

  it('should call onClose when scrolling outside', () => {
    const onClose = jest.fn()
    const outsideElement = document.createElement('div')
    const refs = [{ current: document.createElement('div') }]

    renderHook(() => {
      useScrollToClose(true, onClose, refs)
    })

    const handleScroll = addEventListenerSpy.mock.calls[0][1] as EventListener
    handleScroll({ target: outsideElement } as unknown as Event)

    expect(onClose).toHaveBeenCalled()
  })

  it('should NOT call onClose when scrolling inside ref', () => {
    const onClose = jest.fn()
    const insideElement = document.createElement('div')
    const refs = [{ current: insideElement }]

    renderHook(() => {
      useScrollToClose(true, onClose, refs)
    })

    const handleScroll = addEventListenerSpy.mock.calls[0][1] as EventListener
    // Simulate scroll on the inside element
    handleScroll({ target: insideElement } as unknown as Event)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should NOT call onClose when scrolling inside nested element of ref', () => {
    const onClose = jest.fn()
    const container = document.createElement('div')
    const child = document.createElement('div')
    container.appendChild(child)
    const refs = [{ current: container }]

    renderHook(() => {
      useScrollToClose(true, onClose, refs)
    })

    const handleScroll = addEventListenerSpy.mock.calls[0][1] as EventListener
    handleScroll({ target: child } as unknown as Event)

    expect(onClose).not.toHaveBeenCalled()
  })
})
