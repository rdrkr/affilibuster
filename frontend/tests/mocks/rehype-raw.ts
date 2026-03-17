// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Mock for rehype-raw plugin.
 * In tests, HTML parsing is handled by the react-markdown mock.
 * This mock simply returns an empty plugin function.
 * @returns A no-op function (empty plugin)
 */
const rehypeRaw = (): (() => void) => {
  return () => {
    // No-op: HTML parsing is handled by the mock
  }
}

export default rehypeRaw
