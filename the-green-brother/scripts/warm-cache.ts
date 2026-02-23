// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Cache Warming Script
 *
 * Warms the Next.js cache by making HTTP requests to all static pages in parallel.
 * This script discovers routes from the app directory structure and requests them
 * to trigger on-demand compilation.
 *
 * Usage:
 *   npx tsx scripts/warm-cache.ts
 *   npm run warm-cache
 */

import { existsSync, readdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const protocol = process.env.THE_GREEN_BROTHER_PROTOCOL ?? 'https'
const BASE_URL = process.env.BASE_URL ?? `${protocol}://localhost:${process.env.THE_GREEN_BROTHER_PORT ?? '3000'}`
const LANGUAGES = ['en', 'it', 'he']
const CONCURRENCY = 5
const TIMEOUT_MS = 30000
const APP_DIR = join(__dirname, '..', 'src', 'app', '[lang]')

/**
 * Check if a directory contains a page.tsx file (is a route).
 * @param dirPath Directory path to check
 * @returns True if directory contains page.tsx
 */
function hasPage(dirPath: string): boolean {
  return existsSync(join(dirPath, 'page.tsx'))
}

/**
 * Check if a path segment is a dynamic route (e.g., [slug], [tag]).
 * @param segment Path segment to check
 * @returns True if segment is dynamic
 */
function isDynamicSegment(segment: string): boolean {
  return segment.startsWith('[') && segment.endsWith(']')
}

/**
 * Recursively discover static routes from the app directory.
 * Skips dynamic routes (directories with [param] names).
 * @param dir Directory to scan
 * @param basePath Current path prefix
 * @returns Array of route paths
 */
function discoverRoutes(dir: string, basePath = ''): string[] {
  const routes: string[] = []

  if (!existsSync(dir)) {
    console.warn(`⚠️ App directory not found: ${dir}`)
    return routes
  }

  const entries = readdirSync(dir)

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (!stat.isDirectory()) continue

    // Skip dynamic segments
    if (isDynamicSegment(entry)) continue

    // Handle route groups (parentheses) - they don't add to URL path
    const isRouteGroup = entry.startsWith('(') && entry.endsWith(')')
    const routePath = isRouteGroup ? basePath : `${basePath}/${entry}`

    // If this directory has a page.tsx, it's a route
    if (hasPage(fullPath)) {
      routes.push(routePath || '') // Empty string for root/homepage
    }

    // Recursively check subdirectories
    routes.push(...discoverRoutes(fullPath, routePath))
  }

  return routes
}

/**
 * Generate all URLs to warm by discovering routes from file system.
 * @returns Array of URLs to request
 */
function generateUrls(): string[] {
  const urls: string[] = []
  const routes = discoverRoutes(APP_DIR)

  console.log(`   Discovered ${String(routes.length)} static routes`)

  for (const lang of LANGUAGES) {
    for (const route of routes) {
      urls.push(`${BASE_URL}/${lang}${route}`)
    }
  }

  return urls
}

/**
 * Wait for server to be ready by polling the health endpoint.
 * @param maxAttempts Maximum number of attempts
 * @param delayMs Delay between attempts in milliseconds
 * @returns Promise that resolves when server is ready
 */
async function waitForServer(maxAttempts = 60, delayMs = 1000): Promise<boolean> {
  const healthUrl = `${BASE_URL}/api/health`

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) })
      if (response.ok) {
        console.log('✅ Server is ready')
        return true
      }
    } catch {
      // Server not ready yet
    }

    if (i < maxAttempts - 1) {
      process.stdout.write(`⏳ Waiting for server (attempt ${String(i + 1)}/${String(maxAttempts)})...\r`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  console.error('\n❌ Server did not become ready in time')
  return false
}

/**
 * Warm a single URL.
 * @param url URL to warm
 * @returns Promise with result
 */
async function warmUrl(url: string): Promise<{ url: string; success: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    return { url, success: response.ok, status: response.status }
  } catch (error) {
    return { url, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Process URLs with limited concurrency.
 * @param urls URLs to process
 * @param concurrency Maximum concurrent requests
 */
async function warmWithConcurrency(urls: string[], concurrency: number): Promise<void> {
  const results: { url: string; success: boolean; status?: number; error?: string }[] = []
  let index = 0

  /**
   * Worker function that processes URLs from the shared index.
   * @returns Promise that resolves when all assigned URLs are processed
   */
  async function worker(): Promise<void> {
    while (index < urls.length) {
      const currentIndex = index++
      const url = urls[currentIndex]
      if (!url) continue
      const result = await warmUrl(url)
      results.push(result)

      const icon = result.success ? '✓' : '✗'
      const status = result.status ? ` (${String(result.status)})` : ''
      const error = result.error ? ` - ${result.error}` : ''
      console.log(`  ${icon} ${url}${status}${error}`)
    }
  }

  // Start workers
  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () => worker())
  await Promise.all(workers)

  // Summary
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  console.log(
    `\n📊 Summary: ${String(successful)} succeeded, ${String(failed)} failed out of ${String(urls.length)} pages`
  )
}

/**
 * Main entry point.
 */
async function main(): Promise<void> {
  console.log('🔥 Cache Warming Script')
  console.log(`   Base URL: ${BASE_URL}`)
  console.log(`   Languages: ${LANGUAGES.join(', ')}`)
  console.log(`   Concurrency: ${String(CONCURRENCY)}`)
  console.log('')

  // Wait for server if running as part of dev
  const serverReady = await waitForServer()
  if (!serverReady) {
    process.exit(1)
  }

  console.log('\n📄 Warming static pages...')
  const urls = generateUrls()
  console.log(`   Found ${String(urls.length)} URLs to warm\n`)

  await warmWithConcurrency(urls, CONCURRENCY)

  console.log('\n✅ Cache warming complete!')
}

void main()
