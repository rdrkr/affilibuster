// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Custom Next.js HTTPS Development Server
 *
 * This server enables HTTPS in development mode for testing secure features
 * like secure cookies, CORS policies, and SSL-dependent integrations.
 *
 * Usage:
 *   tsx server.ts
 *
 * Requirements:
 *   - SSL certificates in /certs directory (generated with mkcert)
 *   - Environment variables: ECOPICKS_PROTOCOL, ECOPICKS_PORT
 */

import { readFileSync } from 'fs'
import { createServer as createHttpServer } from 'http'
import { createServer as createHttpsServer } from 'https'
import next from 'next'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dev = process.env.NODE_ENV !== 'production'
// Use localhost for Next.js internal hostname, but bind server to 0.0.0.0 for Docker
const hostname = process.env.ECOPICKS_HOSTNAME ?? 'localhost'
const bindHost = '0.0.0.0' // Bind to all interfaces for Docker healthchecks and networking
const port = parseInt(process.env.ECOPICKS_PORT ?? '3000', 10)
const protocol = process.env.ECOPICKS_PROTOCOL ?? 'http'

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

void app.prepare().then(() => {
  if (protocol === 'https') {
    // HTTPS server for secure development
    const httpsOptions = {
      key: readFileSync(join(__dirname, '..', 'certs', 'localhost-key.pem')),
      cert: readFileSync(join(__dirname, '..', 'certs', 'localhost.pem')),
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
    // HTTP server for non-secure development
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
