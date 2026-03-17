// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Re-export all generated barrel exports from the shared frontend package.
 *
 * The canonical generated code lives in @affilibuster/frontend.
 * This re-export ensures all existing `@/lib/generated` imports
 * in the-green-brother continue working without modification.
 */
export * from '@affilibuster/frontend/generated/index'
