// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Re-export all generated types from the shared frontend package.
 *
 * The canonical generated types live in @affilibuster/frontend.
 * This re-export ensures all existing `@/lib/generated/types.gen` imports
 * in the-green-brother continue working without modification.
 */
export * from '@affilibuster/frontend/generated/types.gen'
