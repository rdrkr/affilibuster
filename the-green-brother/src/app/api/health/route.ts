// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Health Check API Endpoint
 *
 * Lightweight endpoint for load balancer and deployment health checks.
 * Returns immediately without any SSR, database calls, or external dependencies.
 * Used by Render.com and other deployment platforms to verify the app is running.
 */

import { NextResponse } from 'next/server'

/**
 * GET /api/health
 * Returns a simple health check response.
 * @returns JSON response with status and timestamp
 */
export function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
}
