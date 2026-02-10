// Copyright (c) 2025 Affilibuster by Ronen Druker.

// Learn more: https://github.com/testing-library/jest-dom
import { LanguageCode } from '@/lib/generated/types.gen'
import '@testing-library/jest-dom'

// Mock remark (ESM-only package that Jest can't parse)
jest.mock('remark', () => ({
  remark: () => ({
    use: () => ({
      process: (content: string) =>
        Promise.resolve({
          toString: () => content, // Return content unchanged in tests
        }),
    }),
  }),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => LanguageCode.EN,
}))

// Mock window.matchMedia for theme tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock global fetch for API calls
global.fetch = jest.fn().mockImplementation((url: string) => {
  // Default mock response
  const mockResponse = {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => {
      // Return appropriate mock data based on URL with correct API structure
      if (url.includes('/languages')) {
        return Promise.resolve({ data: [] })
      }
      if (url.includes('/currencies')) {
        return Promise.resolve({ data: [] })
      }
      if (url.includes('/navigation')) {
        return Promise.resolve({ data: { items: [] } })
      }
      if (url.includes('/preferences')) {
        return Promise.resolve({ data: { currency: 'USD', theme: 'light' } })
      }
      return Promise.resolve({ data: {} })
    },
    text: () => Promise.resolve(''),
    headers: new Headers(),
  }
  return Promise.resolve(mockResponse)
})

// Fail tests on unexpected console.error calls
// Only suppress known non-critical warnings that are framework-related
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress React act() warnings (framework-related, not our code)
    if (typeof args[0] === 'string' && args[0].includes('An update to') && args[0].includes('was not wrapped in act')) {
      return
    }
    // Suppress jsdom navigation errors (test environment limitation)
    if (
      typeof args[0] === 'object' &&
      args[0] !== null &&
      'message' in args[0] &&
      typeof args[0].message === 'string' &&
      args[0].message.includes('Not implemented: navigation')
    ) {
      return
    }

    // Log the error
    originalError.call(console, ...args)

    // FAIL THE TEST - unexpected errors should cause test failure
    throw new Error(
      `Unexpected console.error in test:\n${args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2))).join(' ')}`
    )
  }
})

afterAll(() => {
  console.error = originalError
})

// Suppress non-error console output during tests (console.log, console.info)
// Keep console.warn and console.error for important messages
const originalLog = console.log
const originalInfo = console.info

beforeAll(() => {
  console.log = jest.fn()
  console.info = jest.fn()
})

afterAll(() => {
  console.log = originalLog
  console.info = originalInfo
})

// Clean up any lingering timers after each test to prevent Jest hanging
afterEach(() => {
  jest.clearAllTimers()
  jest.useRealTimers()
})
