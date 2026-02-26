// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * JsonLdScript Server Component
 *
 * Renders a `<script type="application/ld+json">` tag for embedding
 * Schema.org structured data in page HTML. Accepts any JSON-LD object
 * and serializes it to a safe inline script.
 */

/**
 * Props for the JsonLdScript component.
 */
interface JsonLdScriptProps {
  /** JSON-LD structured data object to serialize into the script tag. */
  data: Record<string, unknown>
}

/**
 * Server component that renders a JSON-LD structured data script tag.
 * Used to inject Schema.org structured data for search engine rich snippets.
 * @param props - Component props
 * @param props.data - JSON-LD object to serialize
 * @returns Script element with JSON-LD content, or null if data is empty
 */
export default function JsonLdScript({ data }: JsonLdScriptProps): React.ReactElement | null {
  if (Object.keys(data).length === 0) {
    return null
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
