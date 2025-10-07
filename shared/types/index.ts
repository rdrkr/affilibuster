// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Shared TypeScript types for Affilibuster platform
 */

export type LanguageCode = 'en' | 'it' | 'he';
export type CurrencyCode = 'USD' | 'EUR' | 'ILS' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY';
export type ContentType = 'page' | 'product' | 'article';
export type ContentStatus = 'draft' | 'published' | 'archived';

/**
 * Language entity
 */
export interface Language {
  code: LanguageCode;
  displayName: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  urlPrefix: string;
  defaultCurrency: CurrencyCode;
  localeCode: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

/**
 * Currency entity
 */
export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
  isActive: boolean;
  sortOrder: number;
}

/**
 * User preferences entity
 */
export interface UserPreferences {
  id: string;
  sessionId: string;
  userId?: string;
  selectedCurrency: CurrencyCode;
  dismissedLanguagePrompt: boolean;
  detectedLanguage?: LanguageCode;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * SEO Metadata
 */
export interface SEOMetadata {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  customSchema?: Record<string, any>;
  canonicalUrl: string;
  alternateUrls: Record<LanguageCode, string>;
}

/**
 * Content response
 */
export interface ContentResponse {
  id: string;
  type: ContentType;
  languageCode: LanguageCode;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  seo: SEOMetadata;
  isPublished: boolean;
  publishedAt?: Date;
  translations: Record<LanguageCode, string>;
}

/**
 * URL data
 */
export interface URLData {
  path: string;
  canonicalUrl: string;
  alternateUrls: Record<LanguageCode, string>;
}
