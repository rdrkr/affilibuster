#!/usr/bin/env node

// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Merge OpenAPI Specifications
 *
 * Combines template.openapi.yaml (backend service APIs) with
 * strapi.openapi.yaml (auto-generated CMS content APIs) into
 * a single affilibuster.openapi.yaml file.
 *
 * The merged spec is then bundled and linted by Redocly.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

interface OpenAPISpec {
  openapi: string
  info: Record<string, unknown>
  servers?: Record<string, unknown>[]
  tags?: Record<string, unknown>[]
  paths: Record<string, unknown>
  components?: {
    schemas?: Record<string, unknown>
    parameters?: Record<string, unknown>
    responses?: Record<string, unknown>
    securitySchemes?: Record<string, unknown>
  }
  security?: Record<string, unknown>[]
  [key: string]: unknown
}

/**
 * Metadata for enriching OpenAPI operation definitions.
 */
interface OperationMetadata {
  summary?: string
  description?: string
  externalDocs?: {
    description?: string
    url: string
  }
}

/**
 * Metadata for enriching OpenAPI parameter definitions.
 */
interface ParameterMetadata {
  description?: string
  example?: unknown
}

/**
 * Metadata for enriching OpenAPI schema definitions.
 */
interface SchemaMetadata {
  description?: string
  example?: unknown
  default?: unknown
  propertyDescriptions?: Record<string, string>
}

/**
 * Complete metadata specification for enriching OpenAPI specs.
 */
interface OpenAPISpecMetadata {
  operations?: Record<string, OperationMetadata> // key: operationId pattern
  parameters?: Record<string, ParameterMetadata> // key: parameter name
  schemas?: Record<string, SchemaMetadata> // key: schema/field pattern
}

/**
 * Default metadata for common Strapi OpenAPI patterns.
 *
 * Provides standardized descriptions, examples, and documentation
 * for auto-generated Strapi endpoints, parameters, and schemas.
 */
const StrapiMetadataDefaults = {
  /**
   * Default metadata for common Strapi query parameters.
   */
  parameters: {
    fields: {
      description:
        'Select specific fields to return in the response (field projection). Only scalar fields can be selected; relations, components, files, and dynamic zones must be populated separately.',
    },
    populate: {
      description:
        'Populate relations, components, media files, and dynamic zones. Use "*" to populate all first-level populatable fields, a string for a single field, or an array for multiple specific fields.',
      example: '*',
    },
    filters: {
      description:
        'Filter entries using Strapi query operators. Supports comparison ($eq, $ne, $lt, $lte, $gt, $gte), containment ($in, $notIn), text search ($contains, $notContains, $startsWith, $endsWith), logical operators ($and, $or, $not), and more.',
    },
    sort: {
      description:
        'Sort the result set by one or more fields. Use field name for ascending order or prefix with "-" for descending (e.g., "-createdAt"). Supports multiple sort criteria.',
      // example removed - now generated dynamically from schema enum values
    },
    pagination: {
      description:
        'Control pagination of collection results. Supports both page-based pagination (page/pageSize) and offset-based pagination (start/limit). Optionally include total count with withCount parameter.',
    },
    locale: {
      description:
        'Select content for a specific locale when using Strapi Internationalization (i18n). Defaults to the default locale if not specified.',
      example: 'en',
    },
    status: {
      description:
        'Filter documents by publication status. Use "published" for published content or "draft" for draft content. Defaults to "published" when not specified.',
      example: 'published',
    },
    _q: {
      description:
        'Full-text search query across searchable fields. Performs case-insensitive search using database-specific text search capabilities.',
      example: 'search terms',
    },
  } as Record<string, ParameterMetadata>,

  /**
   * Default metadata for common Strapi field patterns.
   */
  schemas: {
    documentId: {
      description:
        'The unique document identifier as a UUID (v1-v8 or nil UUID). This ID persists across draft/published versions and localizations of the same document.',
      example: '550e8400-e29b-41d4-a716-446655440000',
    },
    createdAt: {
      description: 'Timestamp when this entry was first created in the CMS.',
      example: '2025-10-30T17:41:47.696Z',
    },
    updatedAt: {
      description: 'Timestamp when this entry was last modified.',
      example: '2025-10-30T18:23:15.432Z',
    },
    publishedAt: {
      description:
        'Timestamp when this entry was published. Null for draft entries. Part of Strapi Draft & Publish feature.',
      example: '2025-10-30T17:41:47.696Z',
    },
    locale: {
      description:
        'The locale code for this content version (e.g., "en", "es", "fr"). Part of Strapi Internationalization (i18n) feature.',
      example: 'en',
    },
    localizations: {
      description:
        'Array of references to other locale versions of this document. Part of Strapi i18n feature for managing multilingual content.',
    },
    email_format: {
      description:
        'RFC 5321 compliant email address. Validated for correct format including domain and TLD requirements.',
      example: 'user@example.com',
    },
    uuid_format: {
      description:
        'Universally Unique Identifier (UUID) in standard 8-4-4-4-12 hexadecimal format, supporting versions 1-8.',
      example: '550e8400-e29b-41d4-a716-446655440000',
    },
  } as Record<string, SchemaMetadata>,

  /**
   * Get complete default metadata specification.
   *
   * @returns Complete metadata object with parameters and schemas defaults
   */
  getDefaults(): OpenAPISpecMetadata {
    return {
      parameters: this.parameters,
      schemas: this.schemas,
    }
  },
} as const

/**
 * Remove DELETE, POST and PUT operations from all paths in the spec.
 *
 * Backend is read-only for Strapi content - no mutations allowed from frontend.
 *
 * @param spec - OpenAPI specification to modify
 * @returns Specification with write operations removed
 */
function removeWriteOperations(spec: OpenAPISpec): OpenAPISpec {
  const processedSpec = { ...spec }
  const processedPaths = { ...spec.paths }

  Object.entries(processedPaths).forEach(([pathKey, pathItem]) => {
    if (pathItem && typeof pathItem === 'object') {
      const processedPathItem = { ...(pathItem as Record<string, unknown>) }
      delete processedPathItem.delete
      delete processedPathItem.put
      delete processedPathItem.post
      processedPaths[pathKey] = processedPathItem
    }
  })

  processedSpec.paths = processedPaths
  return processedSpec
}

/**
 * Remove content-type-builder paths from the specification.
 *
 * Removes /content-types and /content-types/{uid} paths as these are
 * internal Strapi system endpoints that should not be exposed in the backend API.
 *
 * @param spec - OpenAPI specification to modify
 * @returns Specification with content-type-builder paths removed
 */
function removeContentTypesPaths(spec: OpenAPISpec): OpenAPISpec {
  const processedSpec = { ...spec }
  const processedPaths = { ...spec.paths }

  // Remove content-type-builder paths
  delete processedPaths['/content-types']
  delete processedPaths['/content-types/{uid}']

  processedSpec.paths = processedPaths
  return processedSpec
}

/**
 * Fix Strapi pattern fields that contain unsupported regex features.
 *
 * Strapi generates patterns that are not supported by Pydantic v2's Rust-based regex engine:
 * - Email patterns with negative lookahead assertions like (?!\.)(?!.*\.\.)
 * - UUID patterns with complex alternation syntax
 *
 * Solution: Remove all pattern fields since the field type/format already provides validation.
 *
 * @param obj - The object to process (can be any part of the OpenAPI spec)
 * @returns The processed object with all pattern fields removed
 */
function fixStrapiPatterns(obj: unknown): OpenAPISpec {
  if (obj === null || typeof obj !== 'object') {
    return obj as OpenAPISpec
  }

  if (Array.isArray(obj)) {
    return obj.map(item => fixStrapiPatterns(item)) as unknown as OpenAPISpec
  }

  const processed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'pattern') {
      // Skip all pattern fields entirely
      continue
    }

    if (typeof value === 'object' && value !== null) {
      processed[key] = fixStrapiPatterns(value)
    } else {
      processed[key] = value
    }
  }

  return processed as OpenAPISpec
}

/**
 * Remove $id fields from schemas in the specification.
 *
 * Removes all `$id` fields from schema definitions to avoid conflicts
 * or validation issues with code generators.
 *
 * @param obj - The object to process (can be any part of the OpenAPI spec)
 * @returns The processed object with all `$id` fields removed
 */
function removeSchemaIds(obj: unknown): OpenAPISpec {
  if (obj === null || typeof obj !== 'object') {
    return obj as OpenAPISpec
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeSchemaIds(item)) as unknown as OpenAPISpec
  }

  const processed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    // Skip all $id fields
    if (key === '$id') {
      continue
    }

    if (typeof value === 'object' && value !== null) {
      processed[key] = removeSchemaIds(value)
    } else {
      processed[key] = value
    }
  }

  return processed as OpenAPISpec
}

/**
 * Remove UUID format fields from the specification.
 *
 * Removes all `format: uuid` fields from the spec to avoid validation issues
 * or when UUID validation is not needed/desired.
 *
 * @param obj - The object to process (can be any part of the OpenAPI spec)
 * @returns The processed object with all `format: uuid` fields removed
 */
function removeUuidFormat(obj: unknown): OpenAPISpec {
  if (obj === null || typeof obj !== 'object') {
    return obj as OpenAPISpec
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUuidFormat(item)) as unknown as OpenAPISpec
  }

  const processed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    // Skip format field if its value is 'uuid'
    if (key === 'format' && value === 'uuid') {
      continue
    }

    if (typeof value === 'object' && value !== null) {
      processed[key] = removeUuidFormat(value)
    } else {
      processed[key] = value
    }
  }

  return processed as OpenAPISpec
}

/**
 * Remove default values from publishedAt fields in the specification.
 *
 * Removes all `default` fields from publishedAt properties to ensure
 * deterministic OpenAPI generation without timestamp-based changes.
 *
 * @param obj - The object to process (can be any part of the OpenAPI spec)
 * @returns The processed object with all publishedAt default fields removed
 */
function removePublishedAtDefaults(obj: unknown): OpenAPISpec {
  if (obj === null || typeof obj !== 'object') {
    return obj as OpenAPISpec
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removePublishedAtDefaults(item)) as unknown as OpenAPISpec
  }

  const processed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    // If this is a publishedAt property and it has a default field, remove it
    if (key === 'publishedAt' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const publishedAtObj = value as Record<string, unknown>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { default: _defaultValue, ...rest } = publishedAtObj
      processed[key] = removePublishedAtDefaults(rest)
    } else if (typeof value === 'object' && value !== null) {
      processed[key] = removePublishedAtDefaults(value)
    } else {
      processed[key] = value
    }
  }

  return processed as OpenAPISpec
}

/**
 * Add id property to component schemas.
 *
 * Strapi includes an `id` field in all component responses, but the auto-generated
 * OpenAPI spec doesn't include it in component schemas. This causes Pydantic validation
 * to fail with `additionalProperties: false` when the backend receives component data.
 *
 * This function adds the `id` property to component schemas that need it.
 *
 * @param spec - OpenAPI specification to modify
 * @returns Specification with id fields added to component schemas
 */
function addIdToComponentSchemas(spec: OpenAPISpec): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  // Component schemas that need id field (Strapi components)
  const componentSchemas = ['UiContactCardEntry', 'UiFeatureCardEntry', 'UiFeatureItemEntry', 'UiTrustCardEntry']

  if (processed.components?.schemas) {
    Object.entries(processed.components.schemas).forEach(([schemaName, schema]) => {
      if (componentSchemas.includes(schemaName) && schema && typeof schema === 'object') {
        const schemaObj = schema as Record<string, unknown>
        if (schemaObj.properties && typeof schemaObj.properties === 'object') {
          const properties = schemaObj.properties as Record<string, unknown>
          // Add id property if not already present
          properties.id ??= {
            type: 'integer',
            description: 'Component ID',
          }
        }
      }
    })
  }

  return processed
}

/**
 * Add meta field to all response schemas.
 *
 * Strapi always returns a metaobject alongside data in responses.
 * This function adds the meta field to all response schemas that have a data field.
 *
 * @param spec - OpenAPI specification to modify
 * @returns Specification with meta fields added to response schemas
 */
function addMetaToResponses(spec: OpenAPISpec): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  Object.values(processed.paths).forEach(pathItem => {
    if (pathItem && typeof pathItem === 'object') {
      Object.values(pathItem).forEach((operation: unknown) => {
        if (operation && typeof operation === 'object' && 'responses' in operation) {
          const responses = (operation as { responses?: Record<string, unknown> }).responses
          if (responses && typeof responses === 'object') {
            // Process each response (200, 400, etc.)
            Object.values(responses).forEach((response: unknown) => {
              if (response && typeof response === 'object' && 'content' in response) {
                const content = (response as { content?: Record<string, unknown> }).content
                if (content?.['application/json']) {
                  const jsonContent = content['application/json'] as Record<string, unknown>
                  if (jsonContent.schema && typeof jsonContent.schema === 'object') {
                    const schema = jsonContent.schema as Record<string, unknown>
                    // Only add meta to schemas that have a data property
                    if (schema.properties && typeof schema.properties === 'object') {
                      const properties = schema.properties as Record<string, unknown>
                      if (properties.data && !properties.meta) {
                        // Add meta property as optional (not required)
                        // Plugin endpoints (content-type-builder, upload) don't return meta
                        // Content API endpoints do return meta
                        properties.meta = {
                          type: 'object',
                          description: 'Metadata object containing pagination and other response metadata',
                        }
                        // Note: NOT adding to required array - meta is optional
                      }
                    }
                  }
                }
              }
            })
          }
        }
      })
    }
  })

  return processed
}

/**
 * Add servers section to Strapi spec.
 *
 * Documents available Strapi endpoints for internal backend use.
 *
 * @param spec - OpenAPI specification to modify
 * @param prodUrl - Production Strapi CMS URL
 * @param devUrl - Development Strapi CMS URL
 * @returns Specification with servers section added
 */
function addStrapiServers(spec: OpenAPISpec, prodUrl: string, devUrl: string): OpenAPISpec {
  const processedSpec = { ...spec }

  processedSpec.servers = [
    {
      url: prodUrl,
      description: 'Production Strapi CMS',
    },
    {
      url: devUrl,
      description: 'Development Strapi CMS',
    },
  ]

  return processedSpec
}

/**
 * Add license information to Strapi spec info section.
 *
 * Required by OpenAPI best practices and redocly validation.
 *
 * @param spec - OpenAPI specification to modify
 * @returns Specification with license information added
 */
function addStrapiLicense(spec: OpenAPISpec): OpenAPISpec {
  return {
    ...spec,
    info: {
      ...spec.info,
      license: {
        name: 'Proprietary',
        url: 'https://affilibuster.com/license',
      },
    },
  }
}

/**
 * Add tags section with descriptions to Strapi spec.
 *
 * Provides human-readable descriptions for all content types and system APIs.
 *
 * @param spec - OpenAPI specification to modify
 * @returns Specification with tags section added
 */
function addStrapiTags(spec: OpenAPISpec): OpenAPISpec {
  const tags = [
    { name: 'about', description: 'About page content management' },
    {
      name: 'contact',
      description: 'Contact page content and contact information',
    },
    {
      name: 'content-type-builder',
      description: 'Strapi content type schema introspection',
    },
    {
      name: 'currency',
      description: 'Currency configuration and exchange rates',
    },
    { name: 'error-404', description: '404 error page content' },
    { name: 'error-410', description: '410 Gone error page content' },
    { name: 'footer', description: 'Footer content and links' },
    { name: 'homepage', description: 'Homepage content and hero sections' },
    {
      name: 'i18n',
      description: 'Internationalization (i18n) locale management',
    },
    { name: 'navigation', description: 'Navigation menu structure and items' },
    { name: 'privacy', description: 'Privacy policy content' },
    { name: 'product', description: 'Product catalog and details' },
    { name: 'product-page', description: 'Product page layout and content' },
    {
      name: 'system-message',
      description: 'System-wide messages and notifications',
    },
    { name: 'term', description: 'Terms and conditions content' },
    { name: 'upload', description: 'File upload and media library management' },
  ]

  return {
    ...spec,
    tags,
  }
}

/**
 * Fix populate parameter schemas by removing anyOf options with empty enum arrays.
 *
 * Strapi generates `enum: []` for content types with no populatable fields (like Currency),
 * which fails OpenAPI validation. This function removes those invalid anyOf options.
 *
 * @param spec - OpenAPI specification to fix
 * @returns Specification with cleaned populate parameter schemas
 */
function fixEmptyPopulateEnums(spec: OpenAPISpec): OpenAPISpec {
  const fixed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  Object.values(fixed.paths).forEach(pathItem => {
    if (pathItem && typeof pathItem === 'object') {
      Object.values(pathItem).forEach((operation: unknown) => {
        if (operation && typeof operation === 'object' && 'parameters' in operation) {
          const params = (operation as { parameters?: unknown[] }).parameters
          if (Array.isArray(params)) {
            params.forEach(param => {
              if (
                param &&
                typeof param === 'object' &&
                'name' in param &&
                param.name === 'populate' &&
                'schema' in param
              ) {
                const schema = param.schema as Record<string, unknown>
                if (schema.anyOf && Array.isArray(schema.anyOf)) {
                  // Remove anyOf options with empty enum arrays (both direct and nested in items)
                  schema.anyOf = schema.anyOf.filter((option: unknown) => {
                    if (option && typeof option === 'object') {
                      const opt = option as Record<string, unknown>

                      // Check for direct enum
                      if (opt.enum && Array.isArray(opt.enum) && opt.enum.length === 0) {
                        return false // Remove options with empty enum
                      }

                      // Check for nested items.enum (for array types)
                      if (opt.items && typeof opt.items === 'object') {
                        const items = opt.items as Record<string, unknown>
                        if (items.enum && Array.isArray(items.enum) && items.enum.length === 0) {
                          return false // Remove options with empty items.enum
                        }
                      }

                      return true // Keep all other options
                    }
                    return true
                  })
                }
              }
            })
          }
        }
      })
    }
  })

  return fixed
}

/**
 * Add root-level security definition to mark all operations as public.
 *
 * Sets `security: []` at the root level to explicitly mark all operations as not requiring
 * authentication, which satisfies the security-defined linting rule for public APIs.
 *
 * Note: This security definition is only for Strapi spec and will not be merged into
 * the final affilibuster.openapi.yaml (which uses its own security from template).
 *
 * @param spec - OpenAPI specification to modify
 * @returns Specification with root-level security definition added
 */
function addPublicSecurity(spec: OpenAPISpec): OpenAPISpec {
  return {
    ...spec,
    security: [],
  }
}

// ============================================================================
// File I/O Layer
// ============================================================================

/**
 * Read and parse an OpenAPI specification from a YAML file.
 *
 * @param filePath - Absolute path to the OpenAPI YAML file
 * @returns Parsed OpenAPI specification object
 */
function readOpenAPISpec(filePath: string): OpenAPISpec {
  const content = fs.readFileSync(filePath, 'utf-8')
  return yaml.load(content) as OpenAPISpec
}

/**
 * Write an OpenAPI specification to a YAML file.
 *
 * @param filePath - Absolute path where the YAML file should be written
 * @param spec - OpenAPI specification object to serialize
 */
function writeOpenAPISpec(filePath: string, spec: OpenAPISpec): void {
  const yamlContent = yaml.dump(spec, {
    lineWidth: -1, // Prevent line wrapping
    indent: 2,
    noCompatMode: true,
  })
  fs.writeFileSync(filePath, yamlContent, 'utf-8')
}

// ============================================================================
// Preprocessing Layer
// ============================================================================

/**
 * Preprocess Strapi OpenAPI specification with all required transformations.
 *
 * Applies the following transformations in order:
 * - Remove DELETE, POST and PUT operations (backend is read-only for Strapi content)
 * - Remove content-type-builder paths (/content-types and /content-types/{uid})
 * - Add server URLs for Strapi CMS endpoints
 * - Fix pattern fields with unsupported regex features (email, UUID, etc.)
 * - Remove $id fields from schemas
 * - Remove UUID format fields
 * - Add id property to component schemas (Strapi components always include id)
 * - Add meta field to all response schemas
 * - Add license information to info section
 * - Add tags section with descriptions
 * - Fix populate parameter schemas with empty enum arrays
 * - Add security definitions to mark operations as public
 *
 * @param spec - Raw Strapi OpenAPI specification
 * @param config - Configuration with server URLs
 * @param config.strapiUrlProd - Production Strapi URL
 * @param config.strapiUrlDev - Development Strapi URL
 * @returns Preprocessed specification
 */
function preprocessStrapiSpec(spec: OpenAPISpec, config: { strapiUrlProd: string; strapiUrlDev: string }): OpenAPISpec {
  let processed = spec
  processed = removeWriteOperations(processed)
  processed = removeContentTypesPaths(processed)
  processed = addStrapiServers(processed, config.strapiUrlProd, config.strapiUrlDev)
  processed = fixStrapiPatterns(processed)
  processed = removeSchemaIds(processed)
  processed = removeUuidFormat(processed)
  processed = removePublishedAtDefaults(processed)
  processed = addIdToComponentSchemas(processed)
  processed = addMetaToResponses(processed)
  processed = addStrapiLicense(processed)
  processed = addStrapiTags(processed)
  processed = fixEmptyPopulateEnums(processed)
  processed = addPublicSecurity(processed)
  return processed
}

// ============================================================================
// Merging Layer
// ============================================================================

/**
 * Merge paths from template and Strapi specifications.
 *
 * @param template - Template OpenAPI spec
 * @param strapi - Strapi OpenAPI spec
 * @returns Merged paths object
 */
function mergePaths(template: OpenAPISpec, strapi: OpenAPISpec): Record<string, unknown> {
  return {
    ...template.paths,
    ...strapi.paths,
  }
}

/**
 * Merge components from template and Strapi specifications.
 *
 * @param template - Template OpenAPI spec
 * @param strapi - Strapi OpenAPI spec
 * @returns Merged components object
 */
function mergeComponents(template: OpenAPISpec, strapi: OpenAPISpec) {
  return {
    schemas: {
      ...(template.components?.schemas ?? {}),
      ...(strapi.components?.schemas ?? {}),
    },
    parameters: {
      ...(template.components?.parameters ?? {}),
      ...(strapi.components?.parameters ?? {}),
    },
    responses: {
      ...(template.components?.responses ?? {}),
      ...(strapi.components?.responses ?? {}),
    },
    securitySchemes: {
      ...(template.components?.securitySchemes ?? {}),
      ...(strapi.components?.securitySchemes ?? {}),
    },
  }
}

/**
 * Merge tags from template and Strapi specifications.
 *
 * Combines tags from both specs, keeping unique tags by name.
 * Template tags take precedence if there are duplicates.
 *
 * @param template - Template OpenAPI spec
 * @param strapi - Strapi OpenAPI spec
 * @returns Merged tags array
 */
function mergeTags(template: OpenAPISpec, strapi: OpenAPISpec): { name: string; description?: string }[] {
  const templateTags = template.tags ?? []
  const strapiTags = strapi.tags ?? []

  // Create a map to ensure unique tags by name (template takes precedence)
  const tagMap = new Map<string, { name: string; description?: string }>()

  // Add Strapi tags first
  strapiTags.forEach(tag => {
    if ('name' in tag) {
      const tagObj = tag as { name: string; description?: string }
      tagMap.set(tagObj.name, tagObj)
    }
  })

  // Add template tags (overwrite if duplicate)
  templateTags.forEach(tag => {
    if ('name' in tag) {
      const tagObj = tag as { name: string; description?: string }
      tagMap.set(tagObj.name, tagObj)
    }
  })

  return Array.from(tagMap.values())
}

/**
 * Build the final merged OpenAPI specification.
 *
 * @param template - Template spec (structure preserved)
 * @param mergedPaths - Merged paths
 * @param mergedComponents - Merged components
 * @param mergedTags - Merged tags
 * @param config - Configuration with server URLs
 * @param config.backendUrlProd - Production backend URL
 * @param config.backendUrlDev - Development backend URL
 * @returns Complete merged specification
 */
function buildMergedSpec(
  template: OpenAPISpec,
  mergedPaths: Record<string, unknown>,
  mergedComponents: ReturnType<typeof mergeComponents>,
  mergedTags: ReturnType<typeof mergeTags>,
  config: { backendUrlProd: string; backendUrlDev: string }
): OpenAPISpec {
  return {
    ...template,
    paths: mergedPaths,
    components: mergedComponents,
    tags: mergedTags,
    servers: [
      {
        url: config.backendUrlProd,
        description: 'Production Backend',
      },
      {
        url: config.backendUrlDev,
        description: 'Development Backend',
      },
    ],
  }
}

// ============================================================================
// Enhancement Layer
// ============================================================================

/**
 * Enrich OpenAPI specification with metadata descriptions and examples.
 *
 * Applies metadata to parameters and schemas based on pattern matching.
 * Preserves existing non-empty values.
 *
 * @param spec - OpenAPI specification to enrich
 * @param metadata - Metadata definitions to apply
 * @returns Enriched specification
 */
function enrichWithMetadata(spec: OpenAPISpec, metadata: OpenAPISpecMetadata): OpenAPISpec {
  const enriched = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  // Enrich parameters and response schemas in paths
  Object.values(enriched.paths).forEach(pathItem => {
    if (pathItem && typeof pathItem === 'object') {
      const pathObj = pathItem as Record<string, unknown>

      // Process each HTTP method
      Object.values(pathObj).forEach(operation => {
        if (operation && typeof operation === 'object') {
          const op = operation as Record<string, unknown>
          const parameters = op.parameters as Record<string, unknown>[] | undefined

          if (parameters && Array.isArray(parameters)) {
            parameters.forEach(param => {
              const paramName = param.name as string
              const paramMetadata = metadata.parameters?.[paramName]

              if (paramMetadata) {
                // Only set if not already present
                if (!param.description && paramMetadata.description) {
                  param.description = paramMetadata.description
                }
                if (param.schema && typeof param.schema === 'object') {
                  const schema = param.schema as Record<string, unknown>

                  // For fields parameter, ALWAYS generate example from enum values (content-type specific)
                  if (paramName === 'fields' && schema.items && typeof schema.items === 'object') {
                    const items = schema.items as Record<string, unknown>
                    if (items.enum && Array.isArray(items.enum) && items.enum.length > 0) {
                      // Use first 3 enum values as example (overwrite any existing generic example)
                      schema.example = items.enum.slice(0, Math.min(3, items.enum.length))
                    }
                  }
                  // For sort parameter, generate example from anyOf enum values (content-type specific)
                  else if (paramName === 'sort' && schema.anyOf && Array.isArray(schema.anyOf)) {
                    // Extract enum values from anyOf options (usually in the array option)
                    for (const option of schema.anyOf) {
                      if (typeof option === 'object' && option !== null) {
                        const opt = option as Record<string, unknown>
                        // Check if it's an array type with items that have enum
                        if (opt.type === 'array' && opt.items && typeof opt.items === 'object') {
                          const items = opt.items as Record<string, unknown>
                          if (items.enum && Array.isArray(items.enum) && items.enum.length > 0) {
                            // Use first 2 enum values as example (valid field names without '-' prefix)
                            schema.example = items.enum.slice(0, Math.min(2, items.enum.length))
                            break
                          }
                        }
                        // Check if it's a string type with enum directly
                        else if (opt.type === 'string' && opt.enum && Array.isArray(opt.enum) && opt.enum.length > 0) {
                          // Use single enum value for string example
                          schema.example = opt.enum[0]
                          break
                        }
                      }
                    }
                  } else if (!schema.example && paramMetadata.example !== undefined) {
                    // Use metadata example for other parameters (only if not already present)
                    schema.example = paramMetadata.example
                  }
                }
              }
            })
          }

          // Enrich response schemas
          const responses = op.responses as Record<string, unknown> | undefined
          if (responses && typeof responses === 'object') {
            Object.values(responses).forEach(response => {
              if (response && typeof response === 'object') {
                const resp = response as Record<string, unknown>
                const content = resp.content as Record<string, unknown> | undefined
                if (content && typeof content === 'object') {
                  Object.values(content).forEach(mediaType => {
                    if (mediaType && typeof mediaType === 'object') {
                      const media = mediaType as Record<string, unknown>
                      if (media.schema) {
                        enrichSchemaObject(media.schema, metadata)
                      }
                    }
                  })
                }
              }
            })
          }
        }
      })
    }
  })

  // Enrich component schemas
  if (enriched.components?.schemas) {
    Object.values(enriched.components.schemas).forEach(schema => {
      enrichSchemaObject(schema, metadata)
    })
  }

  return enriched
}

/**
 * Recursively enrich a schema object with metadata.
 *
 * @param schema - Schema object to enrich
 * @param metadata - Metadata to apply
 */
function enrichSchemaObject(schema: unknown, metadata: OpenAPISpecMetadata): void {
  if (!schema || typeof schema !== 'object') {
    return
  }

  const schemaObj = schema as Record<string, unknown>

  // Enrich properties if present
  if (schemaObj.properties && typeof schemaObj.properties === 'object') {
    const properties = schemaObj.properties as Record<string, unknown>

    Object.entries(properties).forEach(([propName, propSchema]) => {
      if (propSchema && typeof propSchema === 'object') {
        const prop = propSchema as Record<string, unknown>

        // Match by property name
        const nameMetadata = metadata.schemas?.[propName]
        if (nameMetadata) {
          // Override description if metadata provides one
          if (nameMetadata.description) {
            prop.description = nameMetadata.description
          }
          // Override example if metadata provides one
          if (nameMetadata.example !== undefined) {
            prop.example = nameMetadata.example
          }
          // Override default if metadata provides one
          if (nameMetadata.default !== undefined) {
            prop.default = nameMetadata.default
          }
        }

        // Match by format (e.g., email, uuid)
        const format = prop.format as string | undefined
        if (format) {
          const formatKey = `${format}_format`
          const formatMetadata = metadata.schemas?.[formatKey]
          if (formatMetadata) {
            // Only apply format metadata if property name didn't match
            // (property name takes precedence)
            if (!nameMetadata) {
              if (formatMetadata.description) {
                prop.description = formatMetadata.description
              }
              if (formatMetadata.example !== undefined) {
                prop.example = formatMetadata.example
              }
              if (formatMetadata.default !== undefined) {
                prop.default = formatMetadata.default
              }
            }
          }
        }

        // Recursively process nested schemas
        enrichSchemaObject(prop, metadata)
      }
    })
  }

  // Recursively process arrays
  if (schemaObj.items) {
    enrichSchemaObject(schemaObj.items, metadata)
  }

  // Recursively process allOf, anyOf, oneOf
  ;['allOf', 'anyOf', 'oneOf'].forEach(key => {
    const compositeSchemas = schemaObj[key]
    if (Array.isArray(compositeSchemas)) {
      compositeSchemas.forEach(s => {
        enrichSchemaObject(s, metadata)
      })
    }
  })
}

/**
 * Add missing summaries to operations based on operationId or path.
 *
 * Generates human-readable summaries for operations that don't have one.
 *
 * @param spec - OpenAPI specification to enhance
 * @returns Enhanced specification with summaries added
 */
function addMissingSummaries(spec: OpenAPISpec): OpenAPISpec {
  const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']
  let summaryCount = 0

  Object.entries(spec.paths).forEach(([path, pathItem]: [string, unknown]) => {
    if (pathItem && typeof pathItem === 'object') {
      HTTP_METHODS.forEach(method => {
        const operation = (pathItem as Record<string, unknown>)[method]
        if (operation && typeof operation === 'object') {
          const op = operation as Record<string, unknown>
          if (!op.summary) {
            // Generate a summary from operationId or path
            const operationId = (op.operationId as string) || `${method.toUpperCase()} ${path}`
            // noinspection RegExpSingleCharAlternation
            op.summary = operationId
              .split(/\/|_|-/)
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
              .replace(/([a-z])([A-Z])/g, '$1 $2')
            summaryCount++
          }
        }
      })
    }
  })

  console.log(`   ✓ Added ${summaryCount.toString()} missing summaries`)
  return spec
}

// ============================================================================
// Main Orchestrator
// ============================================================================

/**
 * Main function to merge OpenAPI specifications.
 *
 * This function reads the template and Strapi OpenAPI specifications,
 * preprocesses the Strapi spec, merges them, and writes the
 * final Affilibuster OpenAPI specification.
 */
function mergeOpenAPISpecs(): void {
  const contractsDir = path.resolve(__dirname, '../../contracts')
  const templateFile = 'template.openapi.yaml'
  const strapiFile = 'strapi.openapi.yaml'
  const outputFile = 'affilibuster.openapi.yaml'

  const templatePath = path.join(contractsDir, templateFile)
  const strapiPath = path.join(contractsDir, strapiFile)
  const outputPath = path.join(contractsDir, outputFile)

  // Environment variables for Strapi URLs
  const strapiUrlProd = process.env.CMS_URL_PROD ?? ''
  const strapiUrlDev = process.env.CMS_URL_DEV ?? ''

  // Environment variables for Backend URLs
  const backendUrlProd = process.env.BACKEND_URL_PROD ?? ''
  const backendUrlDev = process.env.BACKEND_URL_DEV ?? ''

  try {
    // Read files
    console.log('📖 Reading OpenAPI specifications...')
    const template = readOpenAPISpec(templatePath)
    let strapi = readOpenAPISpec(strapiPath)

    console.log(`✅ Loaded ${templateFile}`)
    console.log(`✅ Loaded ${strapiFile}`)

    // Preprocess Strapi spec
    console.log('🔧 Preprocessing Strapi specification...')
    strapi = preprocessStrapiSpec(strapi, { strapiUrlProd, strapiUrlDev })
    console.log(
      '✅ Strapi spec preprocessed (PUT/DELETE ops removed, servers added, patterns fixed, $id fields removed, UUID formats removed, publishedAt defaults removed, id fields added to components, meta fields added)'
    )

    // Enrich Strapi spec with metadata
    console.log('✨ Enriching Strapi spec with metadata...')
    strapi = enrichWithMetadata(strapi, StrapiMetadataDefaults.getDefaults())
    console.log('✅ Strapi spec enriched')

    // Add missing summaries to operations
    console.log('📝 Adding summaries to Strapi operations...')
    strapi = addMissingSummaries(strapi)

    // Write the updated Strapi spec back to the file
    console.log('✍️  Updating Strapi specification file...')
    writeOpenAPISpec(strapiPath, strapi)
    console.log(`✅ Updated: ${strapiPath}`)

    // Merge specifications
    console.log('🔀 Merging paths...')
    const mergedPaths = mergePaths(template, strapi)
    console.log(`   ✓ Template paths: ${Object.keys(template.paths).length.toString()}`)
    console.log(`   ✓ Strapi paths: ${Object.keys(strapi.paths).length.toString()}`)
    console.log(`   ✓ Merged total: ${Object.keys(mergedPaths).length.toString()}`)

    console.log('🔀 Merging components...')
    const mergedComponents = mergeComponents(template, strapi)
    const templateSchemaCount = Object.keys(template.components?.schemas ?? {}).length
    const strapiSchemaCount = Object.keys(strapi.components?.schemas ?? {}).length
    const mergedSchemaCount = Object.keys(mergedComponents.schemas).length

    console.log(`   ✓ Template schemas: ${templateSchemaCount.toString()}`)
    console.log(`   ✓ Strapi schemas: ${strapiSchemaCount.toString()}`)
    console.log(`   ✓ Merged total: ${mergedSchemaCount.toString()}`)

    console.log('🔀 Merging tags...')
    const mergedTags = mergeTags(template, strapi)
    const templateTagCount = template.tags?.length ?? 0
    const strapiTagCount = strapi.tags?.length ?? 0
    console.log(`   ✓ Template tags: ${templateTagCount.toString()}`)
    console.log(`   ✓ Strapi tags: ${strapiTagCount.toString()}`)
    console.log(`   ✓ Merged total: ${mergedTags.length.toString()}`)

    // Build merged spec
    console.log('🏗️  Building merged specification...')
    let merged = buildMergedSpec(template, mergedPaths, mergedComponents, mergedTags, {
      backendUrlProd,
      backendUrlDev,
    })

    // Enhance with missing summaries
    console.log('📝 Adding missing summaries to operations...')
    merged = addMissingSummaries(merged)

    // Enrich with metadata
    console.log('✨ Enriching with metadata (descriptions, examples)...')
    merged = enrichWithMetadata(merged, StrapiMetadataDefaults.getDefaults())
    console.log('✅ Metadata enrichment complete')

    // Write merged spec
    console.log('✍️  Writing merged specification...')
    writeOpenAPISpec(outputPath, merged)
    console.log(`✅ Generated: ${outputPath}`)

    // Summary
    console.log('\n📊 Merge Summary:')
    console.log(`   • Paths: ${Object.keys(mergedPaths).length.toString()} total`)
    console.log(`   • Schemas: ${mergedSchemaCount.toString()} total`)
    console.log(`   • Tags: ${mergedTags.length.toString()} total`)
    console.log(`   • Ready for bundling and linting`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ Error merging OpenAPI specs: ${message}`)
    process.exit(1)
  }
}

// Run
mergeOpenAPISpecs()
