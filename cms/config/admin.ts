// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Strapi admin panel configuration
 * Reference: T135 (Custom admin panel translation status field)
 */

import type { UID } from '@strapi/types'

import type { StrapiEnv } from './types'

/**
 * Content type UID to frontend path mapping for preview URLs.
 */
interface PreviewDocument {
  /** Document slug for URL construction */
  slug?: string
}

/**
 * Maps a Strapi content type UID to the corresponding frontend pathname.
 *
 * Used by the preview handler to construct the correct frontend URL
 * when an editor clicks "Open preview" in the Strapi admin panel.
 * @param uid - The Strapi content type UID (e.g., 'api::homepage.homepage')
 * @param options - Options containing locale and document data
 * @param options.locale - The locale code for the content (e.g., 'en', 'it', 'he')
 * @param options.document - The document being previewed, containing slug if applicable
 * @returns The frontend pathname or null if the content type has no preview
 */
function getPreviewPathname(
  uid: string,
  { locale, document }: { locale: string; document: PreviewDocument }
): string | null {
  const slug = document.slug

  const routes: Record<string, string | null> = {
    'api::homepage.homepage': `/${locale}`,
    'api::about.about': `/${locale}/about`,
    'api::blog.blog': `/${locale}/blog`,
    'api::blog-post.blog-post': slug ? `/${locale}/blog/${slug}` : null,
    'api::product.product': slug ? `/${locale}/products/${slug}` : null,
    'api::product-categories-page.product-categories-page': `/${locale}/products`,
    'api::contact-us.contact-us': `/${locale}/contact`,
    'api::privacy.privacy': `/${locale}/privacy`,
    'api::term.term': `/${locale}/terms`,
    'api::cookie-policy.cookie-policy': `/${locale}/cookie-policy`,
    'api::faq.faq': `/${locale}/faq`,
  }

  return routes[uid] ?? null
}

/**
 * Configure Strapi admin panel authentication, security, and preview settings.
 *
 * Configures JWT secrets, session lifespans, API token salts, encryption keys
 * for secure admin panel access and API token generation, and content preview
 * integration with the Next.js frontend via draft mode.
 * @param root0 - Configuration object
 * @param root0.env - Strapi environment configuration helper for accessing environment variables
 * @returns Admin panel configuration object
 */
export default ({ env }: { env: StrapiEnv }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      maxRefreshTokenLifespan: 30 * 24 * 60 * 60, // 30 days in seconds
      maxSessionLifespan: 7 * 24 * 60 * 60, // 7 days in seconds
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  secrets: {
    encryptionKey: env('API_TOKEN_ENCRYPTION_KEY'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('CLIENT_URL'),
      async handler(
        uid: string,
        { documentId, locale, status }: { documentId: string; locale: string; status: string }
      ) {
        const document = await strapi.documents(uid as UID.ContentType).findOne({ documentId })
        if (!document) {
          return null
        }
        const pathname = getPreviewPathname(uid, {
          locale,
          document: document as unknown as PreviewDocument,
        })
        if (!pathname) {
          return null
        }

        const params = new URLSearchParams({
          slug: pathname,
          secret: env('PREVIEW_SECRET'),
          status,
        })

        return `${env('CLIENT_URL')}/api/preview?${params.toString()}`
      },
    },
  },
})
