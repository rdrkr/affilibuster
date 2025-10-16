// Copyright (c) 2025 Affilibuster by Ronen Druker.
// Type tests for API types

import { expectType, expectError, expectAssignable } from 'tsd';
import type {
  LanguageCode,
  CurrencyCode,
  Direction,
  ContentType,
  ContentStatus,
  Language,
  DetectedLanguage,
  Currency,
} from './types/api';

// Test LanguageCode union
expectAssignable<LanguageCode>('en');
expectAssignable<LanguageCode>('it');
expectAssignable<LanguageCode>('he');
expectError<LanguageCode>('fr'); // Invalid language code

// Test CurrencyCode union
expectAssignable<CurrencyCode>('USD');
expectAssignable<CurrencyCode>('EUR');
expectAssignable<CurrencyCode>('ILS');
expectError<CurrencyCode>('XXX'); // Invalid currency code

// Test Direction union
expectAssignable<Direction>('ltr');
expectAssignable<Direction>('rtl');
expectError<Direction>('ttb'); // Invalid direction

// Test ContentType union
expectAssignable<ContentType>('page');
expectAssignable<ContentType>('product');
expectAssignable<ContentType>('article');
expectError<ContentType>('invalid'); // Invalid content type

// Test ContentStatus union
expectAssignable<ContentStatus>('draft');
expectAssignable<ContentStatus>('published');
expectAssignable<ContentStatus>('archived');
expectError<ContentStatus>('pending'); // Invalid status

// Test Language interface structure
const validLanguage: Language = {
  code: 'en',
  displayName: 'English',
  nativeName: 'English',
  direction: 'ltr',
  urlPrefix: '/en',
  defaultCurrency: 'USD',
  localeCode: 'en-US',
  isDefault: true,
  isActive: true,
  sortOrder: 1,
};
expectType<Language>(validLanguage);

// Test invalid Language with wrong direction
expectError<Language>({
  ...validLanguage,
  direction: 'invalid', // Must be 'ltr' | 'rtl'
});

// Test invalid Language with wrong language code
expectError<Language>({
  ...validLanguage,
  code: 'fr', // Must be 'en' | 'it' | 'he'
});

// Test DetectedLanguage interface
const detectedLang: DetectedLanguage = {
  detected: 'en',
  preferred: 'en',
  urlLanguage: 'en',
  browserLanguages: ['en', 'it'],
  fallback: 'en',
};
expectType<DetectedLanguage>(detectedLang);

// Test Currency interface
const validCurrency: Currency = {
  code: 'USD',
  symbol: '$',
  symbolPosition: 'before',
  decimalSeparator: '.',
  thousandsSeparator: ',',
  decimalPlaces: 2,
  displayName: 'US Dollar',
};
expectType<Currency>(validCurrency);

// Test invalid Currency with wrong symbol position
expectError<Currency>({
  ...validCurrency,
  symbolPosition: 'middle', // Must be 'before' | 'after'
});

// Test type assignability
expectAssignable<LanguageCode>('en');
expectAssignable<CurrencyCode>('USD');
expectAssignable<Language>(validLanguage);
