// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Health controller
 *
 * Provides health check endpoint that verifies Strapi initialization completion.
 * Used by Docker healthchecks and Render.com to ensure entrypoint script finished
 * (including seed import, locale setup, token creation, etc.)
 */

interface KoaContext {
  body: unknown
  status: number
}

interface HealthController {
  status: (ctx: KoaContext) => Promise<void>
}

/**
 * Check if /admin endpoint is accessible.
 * @returns Promise resolving to true if /admin is accessible, false otherwise
 */
async function checkAdminHealth(): Promise<boolean> {
  const http = await import('node:http')
  // Force check on local loopback interface to avoid external network issues
  const host = '127.0.0.1'
  // Config/server.ts binds to CMS_PORT, so we must check that port.
  // Fallback to 1337 if not set.
  const port = process.env.CMS_PORT ? parseInt(process.env.CMS_PORT, 10) : 1337

  return new Promise(resolve => {
    const req = http.request(
      {
        hostname: host,
        port,
        path: '/admin',
        method: 'GET',
        timeout: 2000,
      },
      res => {
        // Any response from /admin means Strapi is ready (even redirects)
        resolve(res.statusCode !== undefined && res.statusCode < 500)
      }
    )

    req.on('error', () => {
      resolve(false)
    })
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
    req.end()
  })
}

/**
 * Create health controller with status endpoint.
 * @returns Controller with status method
 */
export default {
  /**
   * Check if Strapi initialization is complete.
   *
   * In production: Returns 200 when /admin endpoint is accessible.
   * In development: Returns 200 when /tmp/strapi_ready marker file exists (set by entrypoint).
   * Returns 503 when initialization is still in progress.
   * @param ctx - Koa context object
   */
  async status(ctx: KoaContext): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production'
    let isReady = false

    if (isProduction) {
      // Production: Check if Strapi is actually ready by verifying /admin endpoint
      isReady = await checkAdminHealth()
    } else {
      // Development: Check for marker file created by docker-entrypoint.sh
      const { existsSync } = await import('node:fs')
      const markerFile = '/tmp/strapi_ready'
      isReady = existsSync(markerFile)
    }

    if (isReady) {
      ctx.body = { status: 'ready', ready: true }
    } else {
      ctx.status = 503
      ctx.body = {
        status: 'initializing',
        ready: false,
        message: 'Waiting for initialization to complete',
      }
    }
  },
} satisfies HealthController
