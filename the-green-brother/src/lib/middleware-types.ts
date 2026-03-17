// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Language codes for middleware (Edge Runtime).
 *
 * This is a local copy of the `LanguageCode` enum from the generated types.
 * Edge Runtime middleware cannot import from `@affilibuster/frontend` because
 * turbopack restricts module resolution to within the project root in Docker.
 *
 * Keep this in sync with the `LanguageCode` enum in
 * `@affilibuster/frontend/generated/types.gen`.
 */
export enum LanguageCode {
  EN = 'en',
  IT = 'it',
  HE = 'he',
}
