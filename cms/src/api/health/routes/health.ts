// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Health routes configuration
 *
 * Defines the /api/health endpoint used by Docker and Render.com.
 * This endpoint verifies that Strapi has completed initialization including
 * seed import, locale setup, and token generation.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/health',
      handler: 'health.status',
      config: {
        auth: false,
        policies: [],
        description: 'Check if Strapi initialization is complete',
        tags: ['health'],
      },
    },
  ],
}
