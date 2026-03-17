// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * Custom Next.js HTTPS Development Server for GentleHawk
 *
 * Enables HTTPS in development mode for testing secure features
 * like secure cookies, CORS policies, and SSL-dependent integrations.
 *
 * Usage:
 *   tsx server.ts
 *
 * Requirements:
 *   - SSL certificates in /certs directory (generated with mkcert)
 *   - Environment variables: GENTLE_HAWK_PROTOCOL, GENTLE_HAWK_PORT
 */

import { existsSync, readFileSync } from 'fs'
import { createServer as createHttpServer } from 'http'
import { createServer as createHttpsServer } from 'https'
import next from 'next'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.GENTLE_HAWK_HOSTNAME ?? 'localhost'
const bindHost = '0.0.0.0'
const port = parseInt(process.env.GENTLE_HAWK_PORT ?? '3001', 10)
const protocol = process.env.GENTLE_HAWK_PROTOCOL ?? 'http'

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

void app.prepare().then(() => {
  const keyPath = join(__dirname, '..', 'certs', 'localhost-key.pem')
  const certPath = join(__dirname, '..', 'certs', 'localhost.pem')
  const hasCerts = existsSync(keyPath) && existsSync(certPath)

  if (protocol === 'https' && hasCerts) {
    const httpsOptions = {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    }

    createHttpsServer(httpsOptions, (req, res) => {
      void (async () => {
        try {
          await handle(req, res)
        } catch (err) {
          console.error('Error handling request:', err)
          res.statusCode = 500
          res.end('Internal Server Error')
        }
      })()
    }).listen(port, bindHost, () => {
      console.log(`> Ready on https://${bindHost}:${String(port)} (accessible via https://${hostname}:${String(port)})`)
    })
  } else {
    if (protocol === 'https' && !hasCerts) {
      console.warn('Warning: HTTPS protocol requested but certificates not found. Falling back to HTTP.')
      console.warn('    Expected certs at:', certPath)
    }

    createHttpServer((req, res) => {
      void (async () => {
        try {
          await handle(req, res)
        } catch (err) {
          console.error('Error handling request:', err)
          res.statusCode = 500
          res.end('Internal Server Error')
        }
      })()
    }).listen(port, bindHost, () => {
      console.log(`> Ready on http://${bindHost}:${String(port)} (accessible via http://${hostname}:${String(port)})`)
    })
  }
})
