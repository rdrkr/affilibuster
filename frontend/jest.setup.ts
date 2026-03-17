// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { LanguageCode } from '@/lib/generated/types.gen'
import '@testing-library/jest-dom'

// Mock next/dynamic to eagerly load components (React.lazy doesn't resolve synchronously in Jest)
jest.mock('next/dynamic', () => {
  const react = jest.requireActual<typeof import('react')>('react')
  return function dynamic(importFn: () => Promise<{ default: React.ComponentType }>) {
    let Component: React.ComponentType | null = null
    void importFn().then((mod: { default: React.ComponentType }) => {
      Component = mod.default
    })
    // In Jest, the promise resolves synchronously when the module is already loaded/mocked
    const DynamicWrapper = (props: Record<string, unknown>) => {
      if (!Component) return null
      return react.createElement(Component, props)
    }
    DynamicWrapper.displayName = 'DynamicMock'
    return DynamicWrapper
  }
})

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
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock global fetch for API calls
global.fetch = jest.fn().mockImplementation((url: string) => {
  const mockResponse = {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => {
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
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('An update to') && args[0].includes('was not wrapped in act')) {
      return
    }
    if (
      typeof args[0] === 'object' &&
      args[0] !== null &&
      'message' in args[0] &&
      typeof args[0].message === 'string' &&
      args[0].message.includes('Not implemented: navigation')
    ) {
      return
    }
    originalError.call(console, ...args)
    throw new Error(
      `Unexpected console.error in test:\n${args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2))).join(' ')}`
    )
  }
})

afterAll(() => {
  console.error = originalError
})

// Suppress non-error console output during tests
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

// Clean up any lingering timers after each test
afterEach(() => {
  jest.clearAllTimers()
  jest.useRealTimers()
})
