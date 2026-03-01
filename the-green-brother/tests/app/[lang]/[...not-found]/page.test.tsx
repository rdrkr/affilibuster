// Copyright (c) 2026 Affilibuster by Ronen Druker.

import CatchAllNotFound from '@/app/[lang]/[...not-found]/page'
import { notFound } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

describe('CatchAllNotFound Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call notFound() when rendered', () => {
    CatchAllNotFound()
    expect(notFound).toHaveBeenCalledTimes(1)
  })
})
