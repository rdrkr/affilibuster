// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Default sanitization schema from rehype-sanitize.
 * Provides a sensible default for HTML sanitization.
 */
export const defaultSchema = {
  tagNames: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
    'em',
    'strong',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  attributes: {
    a: ['href', 'title'],
    img: ['src', 'alt', 'title'],
    '*': ['className'],
  },
}

/**
 * Mock for rehype-sanitize plugin.
 * In tests, sanitization is not performed since we trust test content.
 * This mock simply returns an empty plugin function.
 * @returns A no-op function (empty plugin)
 */
const rehypeSanitize = (): (() => void) => {
  return () => {
    // No-op: sanitization is not needed in tests
  }
}

export default rehypeSanitize
