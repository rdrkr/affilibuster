// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * TypeScript types for API responses
 * Reference: Backend Pydantic models (contracts/api-v1.yaml)
 */

export interface Language {
  code: string;
  displayName: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  urlPrefix: string;
  defaultCurrency: string;
  isDefault: boolean;
}

export interface DetectLanguageResponse {
  detectedLanguage: string;
  confidence: number;
  shouldPrompt: boolean;
  alternatives?: string[];
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface URLData {
  path: string;
  languagePrefix: string;
  current: string;
  canonical: string;
  alternates: Record<string, string>;
}

export interface ContentResponse {
  id: string;
  type: 'page' | 'product' | 'article';
  language: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  seo: SEOMetadata;
  urls: URLData;
  status: string;
  fallbackUsed?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  translations: Record<string, string>;
}

export interface ContentSummary {
  id: string;
  type: 'page' | 'product' | 'article';
  language: string;
  title: string;
  slug: string;
  excerpt?: string;
  url: string;
  status: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ContentListResponse {
  data: ContentSummary[];
  pagination: Pagination;
}

export interface Currency {
  code: string;
  displayName: string;
  symbol: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface ConvertCurrencyResponse {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  formatted: string;
  rate: number;
  timestamp: string;
}

export interface UserPreferences {
  id: string;
  sessionId: string;
  selectedCurrency: string;
  dismissedLanguagePrompt: boolean;
  detectedLanguage?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  details?: Record<string, any>;
}
