// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Sitemap generation API route
 * Reference: T148, T148A (Language-specific sitemaps)
 * research.md:186-188 (sitemap-en.xml, sitemap-it.xml, sitemap-il.xml)
 */

import { NextRequest, NextResponse } from 'next/server';

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Fetch content from backend API for sitemap generation
 */
async function fetchContentForLanguage(lang: string): Promise<any[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/v1/content/${lang}?limit=1000`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch content for ${lang}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching content for ${lang}:`, error);
    return [];
  }
}

/**
 * Generate sitemap XML for a specific language
 */
function generateSitemapXML(urls: SitemapURL[]): string {
  const urlEntries = urls
    .map((url) => {
      let entry = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`;

      if (url.lastmod) {
        entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }

      if (url.changefreq) {
        entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }

      if (url.priority !== undefined) {
        entry += `\n    <priority>${url.priority}</priority>`;
      }

      entry += `\n  </url>`;
      return entry;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * GET handler for language-specific sitemaps
 * Routes: /api/sitemap-en.xml, /api/sitemap-it.xml, /api/sitemap-il.xml
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  try {
    const lang = params.lang.replace('.xml', ''); // Extract lang from filename
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://affilibuster.com';

    // Validate language
    const validLangs = ['en', 'it', 'il', 'he'];
    if (!validLangs.includes(lang)) {
      return new NextResponse('Invalid language', { status: 404 });
    }

    // Map 'il' to 'he' for API calls (il is URL prefix, he is language code)
    const apiLang = lang === 'il' ? 'he' : lang;

    // Fetch content from backend
    const content = await fetchContentForLanguage(apiLang);

    // Build sitemap URLs
    const urls: SitemapURL[] = [];

    // Add homepage
    const homePath = lang === 'en' ? '/' : `/${lang}`;
    urls.push({
      loc: `${baseUrl}${homePath}`,
      changefreq: 'daily',
      priority: 1.0,
    });

    // Add content pages
    for (const item of content) {
      // Construct URL from content item
      const path = lang === 'en'
        ? `/${item.type}/${item.slug}`
        : `/${lang}/${item.type}/${item.slug}`;

      urls.push({
        loc: `${baseUrl}${path}`,
        lastmod: item.updatedAt || item.publishedAt,
        changefreq: item.type === 'page' ? 'weekly' : 'monthly',
        priority: item.type === 'page' ? 0.8 : 0.6,
      });
    }

    // Generate XML
    const xml = generateSitemapXML(urls);

    // Return XML response
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
