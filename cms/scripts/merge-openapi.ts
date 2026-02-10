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
import * as yaml from 'js-yaml'
import * as path from 'path'

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
 * Remove components paths from the specification.
 *
 * Removes /components and /components/{uid} paths as these are
 * internal Strapi component metadata endpoints that should not be exposed in the backend API.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with components paths removed
 */
function removeComponentsPaths(spec: OpenAPISpec): OpenAPISpec {
  const processedSpec = { ...spec }
  const processedPaths = { ...spec.paths }

  // Remove components metadata paths
  delete processedPaths['/components']
  delete processedPaths['/components/{uid}']

  processedSpec.paths = processedPaths
  return processedSpec
}

/**
 * Remove content-type-builder tag from the specification.
 *
 * Removes the content-type-builder tag as it's only used for internal
 * Strapi component metadata endpoints that are not exposed in the backend API.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with content-type-builder tag removed
 */
function removeContentTypeBuilderTag(spec: OpenAPISpec): OpenAPISpec {
  const processedSpec = { ...spec }

  if (processedSpec.tags && Array.isArray(processedSpec.tags)) {
    processedSpec.tags = processedSpec.tags.filter(tag => {
      if ('name' in tag) {
        return (tag as { name: string }).name !== 'content-type-builder'
      }
      return true
    })
  }

  return processedSpec
}

/**
 * Remove locales paths from the specification.
 *
 * Removes /locales path as this is an internal Strapi i18n endpoint
 * that should not be exposed in the backend API.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with locales paths removed
 */
function removeLocalesPaths(spec: OpenAPISpec): OpenAPISpec {
  const processedSpec = { ...spec }
  const processedPaths = { ...spec.paths }

  // Remove locales path
  delete processedPaths['/locales']

  processedSpec.paths = processedPaths
  return processedSpec
}

/**
 * Remove i18n tag from the specification.
 *
 * Removes the i18n tag as it's only used for internal
 * Strapi internationalization endpoints that are not exposed in the backend API.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with i18n tag removed
 */
function removeI18nTag(spec: OpenAPISpec): OpenAPISpec {
  const processedSpec = { ...spec }

  if (processedSpec.tags && Array.isArray(processedSpec.tags)) {
    processedSpec.tags = processedSpec.tags.filter(tag => {
      if ('name' in tag) {
        return (tag as { name: string }).name !== 'i18n'
      }
      return true
    })
  }

  return processedSpec
}

/**
 * Get plugin names to exclude from the specification.
 *
 * Combines:
 * 1. Folders in cms/src/plugins (local plugins)
 * 2. Dependencies in cms/package.json starting with "strapi-plugin-" (installed plugins)
 * @returns Array of plugin names to exclude
 */
function getPluginNames(): string[] {
  const pluginNames = new Set<string>()

  // 1. Local plugins from cms/src/plugins
  const pluginsDir = path.resolve(__dirname, '../src/plugins')
  if (fs.existsSync(pluginsDir)) {
    const entries = fs.readdirSync(pluginsDir, { withFileTypes: true })
    entries.filter(entry => entry.isDirectory()).forEach(entry => pluginNames.add(entry.name))
  }

  // 2. Installed plugins from cms/package.json
  try {
    const packageJsonPath = path.resolve(__dirname, '../package.json')
    if (fs.existsSync(packageJsonPath)) {
      const content = fs.readFileSync(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(content) as {
        dependencies?: Record<string, string>
        devDependencies?: Record<string, string>
      }
      const dependencies = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) }

      Object.keys(dependencies).forEach(dep => {
        // Filter for packages starting with "strapi-plugin-"
        if (dep.startsWith('strapi-plugin-')) {
          pluginNames.add(dep)
        }
      })
    }
  } catch {
    console.warn('   ⚠ Could not read package.json to filter installed plugins')
  }

  return Array.from(pluginNames)
}

/**
 * Remove plugin paths from the specification.
 *
 * Removes paths belonging to plugins identified by getPluginNames().
 * Plugin endpoints are identified by operations with tags matching plugin names.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with plugin paths removed
 */
function removePluginPaths(spec: OpenAPISpec): OpenAPISpec {
  const pluginNames = getPluginNames()

  if (pluginNames.length === 0) {
    return spec
  }

  const processedSpec = { ...spec }
  const processedPaths: Record<string, unknown> = {}

  Object.entries(spec.paths).forEach(([pathKey, pathItem]) => {
    if (typeof pathItem !== 'object' || pathItem === null) {
      return
    }

    // Check if any operation on this path has a plugin tag
    const isPluginPath = Object.values(pathItem as Record<string, unknown>).some(operation => {
      if (operation && typeof operation === 'object' && 'tags' in operation) {
        const tags = (operation as { tags?: string[] }).tags
        if (Array.isArray(tags)) {
          return tags.some(tag => pluginNames.includes(tag))
        }
      }
      return false
    })

    // Only keep paths that are not plugin paths
    if (!isPluginPath) {
      processedPaths[pathKey] = pathItem
    }
  })

  processedSpec.paths = processedPaths
  return processedSpec
}

/**
 * Remove plugin tags from the specification.
 *
 * Removes tags belonging to plugins identified by getPluginNames().
 * @param spec - OpenAPI specification to modify
 * @returns Specification with plugin tags removed
 */
function removePluginTags(spec: OpenAPISpec): OpenAPISpec {
  const pluginNames = getPluginNames()

  if (pluginNames.length === 0) {
    return spec
  }

  const processedSpec = { ...spec }

  if (processedSpec.tags && Array.isArray(processedSpec.tags)) {
    processedSpec.tags = processedSpec.tags.filter(tag => {
      if ('name' in tag) {
        return !pluginNames.includes((tag as { name: string }).name)
      }
      return true
    })
  }

  return processedSpec
}

/**
 * Remove health check paths from the specification.
 *
 * Removes /health and other health check endpoints as these are
 * internal infrastructure endpoints that should not be exposed in the backend API.
 * These endpoints are only for Docker/Render.com healthchecks.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with health check paths removed
 */
function removeHealthCheckPaths(spec: OpenAPISpec): OpenAPISpec {
  const processedSpec = { ...spec }
  const processedPaths = { ...spec.paths }

  // Remove health check paths (internal infrastructure endpoints)
  delete processedPaths['/health']
  delete processedPaths['/health/ready']

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
 * This function adds the `id` property to ALL component schemas (those ending with 'Entry').
 * Strapi components always have an `id` field at runtime.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with id fields added to component schemas
 */
function addIdToComponentSchemas(spec: OpenAPISpec): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  if (processed.components?.schemas) {
    Object.entries(processed.components.schemas).forEach(([schemaName, schema]) => {
      // All Strapi component schemas end with 'Entry' (e.g., ElementsButtonEntry, MenusSearchMenuEntry)
      // These components always have an 'id' field at runtime that's not in the generated spec
      if (schemaName.endsWith('Entry') && schema && typeof schema === 'object') {
        const schemaObj = schema as Record<string, unknown>
        if (schemaObj.properties && typeof schemaObj.properties === 'object') {
          const properties = schemaObj.properties as Record<string, unknown>
          // Add id property if not already present
          properties.id ??= {
            type: 'integer',
            description: 'Component instance ID',
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
        url: 'https://thegreenbrother.com/license',
      },
    },
  }
}

/**
 * Add tags section with descriptions to Strapi spec.
 *
 * Provides human-readable descriptions for all content types and system APIs.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with tags section added
 */
function addStrapiTags(spec: OpenAPISpec): OpenAPISpec {
  const tags = [
    { name: 'about', description: 'About page content management' },
    { name: 'auth-page', description: 'Authentication page content (login, signup, password reset)' },
    { name: 'blog', description: 'Blog page content and configuration' },
    { name: 'blog-post', description: 'Blog posts and articles' },
    { name: 'blog-post-tag', description: 'Blog post tags for categorization' },
    { name: 'contributor', description: 'Contributor profiles, their roles and blog posts' },
    { name: 'contributor-role', description: 'Contributor roles' },
    { name: 'consent', description: 'Cookie consent page content and configuration' },
    { name: 'consent-category', description: 'Cookie consent category definitions' },
    { name: 'contact-us', description: 'Contact page content and contact information' },
    { name: 'currency', description: 'Currency configuration and exchange rates' },
    { name: 'error-404', description: '404 Not Found error page content' },
    { name: 'error-410', description: '410 Gone error page content' },
    { name: 'faq', description: 'Frequently Asked Questions content' },
    { name: 'feature-flag', description: 'Feature flags for controlling feature availability' },
    { name: 'footer', description: 'Footer content and links' },
    { name: 'health', description: 'Health check endpoints for service monitoring' },
    { name: 'homepage', description: 'Homepage content and hero sections' },
    { name: 'navigation', description: 'Navigation menu structure and items' },
    { name: 'privacy', description: 'Privacy policy content' },
    { name: 'product', description: 'Product catalog and details' },
    { name: 'product-categories-page', description: 'Product categories listing page content' },
    { name: 'product-category', description: 'Product category definitions and metadata' },
    { name: 'product-certificate', description: 'Product certifications' },
    { name: 'product-tag', description: 'Product tags for filtering and categorization' },
    { name: 'profile', description: 'User profile page content' },
    { name: 'redirects', description: 'URL redirect rules and configurations' },
    { name: 'term', description: 'Terms and conditions content' },
    { name: 'theme', description: 'Theme and styling configuration' },
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
 * Replace 'populate' parameter with nested-populator plugin parameters.
 *
 * The strapi-plugin-nested-populator uses 'customPopulate' (required string),
 * 'customDepth' (optional integer), and 'customIgnored' (optional string array)
 * to control population logic. accurate typing fixes API client generation.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with updated parameters
 */
function replacePopulateWithNestedPopulator(spec: OpenAPISpec): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  Object.values(processed.paths).forEach(pathItem => {
    if (pathItem && typeof pathItem === 'object') {
      Object.values(pathItem).forEach((operation: unknown) => {
        if (operation && typeof operation === 'object' && 'parameters' in operation) {
          const params = (operation as { parameters?: unknown[] }).parameters
          if (Array.isArray(params)) {
            // Filter out original 'populate' parameter
            const oldLength = params.length
            const newParams = params.filter(param => {
              if (param && typeof param === 'object' && 'name' in param) {
                return (param as { name: string }).name !== 'populate'
              }
              return true
            })

            // Only add new params if 'populate' was present and filtered out
            if (newParams.length < oldLength) {
              // customPopulate (Required)
              newParams.push({
                name: 'customPopulate',
                in: 'query',
                description:
                  'Populate fields using nested-populator syntax. Use "nested" for full depth or specify fields.',
                required: true,
                schema: {
                  type: 'string',
                  default: 'nested',
                },
              })

              // customDepth (Optional)
              newParams.push({
                name: 'customDepth',
                in: 'query',
                description: 'Maximum depth for population (override plugin default)',
                required: false,
                schema: {
                  type: 'integer',
                },
              })

              // customIgnored (Optional)
              newParams.push({
                name: 'customIgnored',
                in: 'query',
                description: 'Fields to ignore during population',
                required: false,
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              })
            }

            ;(operation as { parameters: unknown[] }).parameters = newParams
          }
        }
      })
    }
  })

  return processed
}

/**
 * Add relational fields to the filters enum for all endpoints.
 *
 * Strapi's OpenAPI plugin excludes relational fields from the filters enum,
 * but filtering by relations (e.g., filters[category][name][$eq]=...) is supported.
 * This function automatically detects relational fields in the response schema
 * (marked with description "A relational field") and adds them to the allowed filter keys.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with updated filters
 */
function addRelationalFieldsToFilters(spec: OpenAPISpec): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  Object.values(processed.paths).forEach(pathItem => {
    if (pathItem && typeof pathItem === 'object') {
      const operation = (pathItem as Record<string, unknown>).get as Record<string, unknown> | undefined

      // Only process GET operations
      if (operation) {
        // 1. Find relational fields in the response schema
        const relationalFields: string[] = []

        if (operation.responses && typeof operation.responses === 'object') {
          const responses = operation.responses as Record<string, unknown>
          const successResponse = responses['200'] as Record<string, unknown> | undefined

          if (successResponse?.content) {
            const content = successResponse.content as Record<string, unknown>
            const jsonContent = content['application/json'] as Record<string, unknown> | undefined

            if (jsonContent?.schema) {
              const schema = jsonContent.schema as Record<string, unknown>

              // Check for data property
              if (schema.properties && typeof schema.properties === 'object') {
                const properties = schema.properties as Record<string, unknown>
                const data = properties.data as Record<string, unknown> | undefined

                if (data) {
                  let attributes: Record<string, unknown> | undefined

                  // Handle collection response (data is array of items)
                  if (data.type === 'array' && data.items && typeof data.items === 'object') {
                    const items = data.items as Record<string, unknown>
                    if (items.properties && typeof items.properties === 'object') {
                      attributes = items.properties as Record<string, unknown>
                    }
                  }
                  // Handle single response (data is object)
                  else if (data.type === 'object' && data.properties && typeof data.properties === 'object') {
                    attributes = data.properties as Record<string, unknown>
                  }

                  // Extract relational fields
                  if (attributes) {
                    Object.entries(attributes).forEach(([key, value]) => {
                      if (value && typeof value === 'object') {
                        const attr = value as Record<string, unknown>
                        if (attr.description === 'A relational field') {
                          relationalFields.push(key)
                        }
                      }
                    })
                  }
                }
              }
            }
          }
        }

        // 2. Add found relational fields to filters enum
        if (relationalFields.length > 0 && operation.parameters && Array.isArray(operation.parameters)) {
          const filtersParam = operation.parameters.find(p => {
            if (p && typeof p === 'object') {
              const param = p as Record<string, unknown>
              return param.name === 'filters' && param.in === 'query'
            }
            return false
          }) as Record<string, unknown> | undefined

          if (filtersParam?.schema && typeof filtersParam.schema === 'object') {
            const schema = filtersParam.schema as Record<string, unknown>
            if (schema.propertyNames && typeof schema.propertyNames === 'object') {
              const propertyNames = schema.propertyNames as Record<string, unknown>
              if (propertyNames.enum && Array.isArray(propertyNames.enum)) {
                const enums = propertyNames.enum as string[]

                // Add missing fields
                relationalFields.forEach(field => {
                  if (!enums.includes(field)) {
                    enums.push(field)
                  }
                })

                // Sort for consistency
                propertyNames.enum = enums.sort()
              }
            }
          }
        }
      }
    }
  })

  return processed
}

/**
 * Simplify localizations field schema to use minimal reference type.
 *
 * Strapi returns localizations as shallow references containing only scalar fields
 * (id, documentId, locale, timestamps, and content type-specific scalar fields),
 * but NOT component or relation fields.
 *
 * The generated OpenAPI spec uses $ref to the full document schema for localizations,
 * causing Pydantic validation errors when component fields marked as required
 * are missing from the shallow localization references.
 *
 * This function replaces the localizations items $ref with an inline
 * simple object schema matching what Strapi actually returns.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with simplified localizations schema
 */
function simplifyLocalizationsSchema(spec: OpenAPISpec): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  // Simple localization reference schema that matches what Strapi actually returns
  // Uses additionalProperties: true to allow content type-specific scalar fields
  const simpleLocalizationSchema = {
    type: 'object',
    description: 'Simplified localization reference as returned by Strapi (scalar fields only, no components)',
    properties: {
      id: { type: 'number' },
      documentId: {
        type: 'string',
        description: 'The unique document identifier',
      },
      locale: {
        type: 'string',
        description: 'The locale code for this localization',
      },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
      publishedAt: { type: 'string' },
    },
    required: ['id', 'documentId', 'locale'],
    additionalProperties: true, // Allow content type-specific scalar fields
  }

  /**
   * Recursively traverse an object and replace localizations items schema.
   * @param obj - Object to traverse
   */
  function traverse(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return

    const record = obj as Record<string, unknown>

    // Check if this object has a 'localizations' property with items.$ref
    if (
      record.localizations &&
      typeof record.localizations === 'object' &&
      (record.localizations as Record<string, unknown>).type === 'array' &&
      (record.localizations as Record<string, unknown>).items
    ) {
      const items = (record.localizations as Record<string, unknown>).items as Record<string, unknown>
      if (items.$ref) {
        // Replace $ref with inline simple schema
        ;(record.localizations as Record<string, unknown>).items = simpleLocalizationSchema
      }
    }

    // Recursively process all nested objects and arrays
    for (const value of Object.values(record)) {
      if (Array.isArray(value)) {
        value.forEach(item => {
          traverse(item)
        })
      } else if (value && typeof value === 'object') {
        traverse(value)
      }
    }
  }

  // Traverse paths (response schemas)
  traverse(processed.paths)

  // Traverse component schemas
  if (processed.components?.schemas) {
    traverse(processed.components.schemas)
  }

  return processed
}

/**
 * Add 200 responses to operations that only have error responses.
 *
 * Strapi's OpenAPI generation sometimes creates endpoints with only error responses (400, 404, etc.)
 * but no success responses. This fails OpenAPI validation which requires at least one 2XX response.
 * This function adds a generic 200 response to any operation missing a success response.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with 200 responses added where missing
 */
function addMissing200Responses(spec: OpenAPISpec): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  Object.values(processed.paths).forEach(pathItem => {
    if (pathItem && typeof pathItem === 'object') {
      Object.values(pathItem).forEach((operation: unknown) => {
        if (operation && typeof operation === 'object' && 'responses' in operation) {
          const responses = (operation as { responses?: Record<string, unknown> }).responses
          if (responses && typeof responses === 'object') {
            // Check if operation has any 2XX response
            const has2xxResponse = Object.keys(responses).some(code => {
              const statusCode = parseInt(code, 10)
              return statusCode >= 200 && statusCode < 300
            })

            // If no 2XX response exists, add a generic 200 response
            if (!has2xxResponse) {
              responses['200'] = {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              }
            }
          }
        }
      })
    }
  })

  return processed
}

/**
 * Add root-level security definition to mark all operations as public.
 *
 * Sets `security: []` at the root level to explicitly mark all operations as not requiring
 * authentication, which satisfies the security-defined linting rule for public APIs.
 *
 * Note: This security definition is only for Strapi spec and will not be merged into
 * the final affilibuster.openapi.yaml (which uses its own security from template).
 * @param spec - OpenAPI specification to modify
 * @returns Specification with root-level security definition added
 */
function addPublicSecurity(spec: OpenAPISpec): OpenAPISpec {
  return {
    ...spec,
    security: [],
  }
}

/**
 * Fix upload files endpoint schema to match actual Strapi 5 response structure.
 *
 * Strapi 5 upload plugin returns additional fields that aren't in the auto-generated spec:
 * - publishedAt: Publication timestamp for the file
 * - isUrlSigned: Whether the file URL is signed (for private files)
 *
 * Additionally, folderPath is marked as required in the spec but isn't always returned.
 *
 * This function:
 * 1. Adds publishedAt field (optional string with date-time format)
 * 2. Adds isUrlSigned field (optional boolean)
 * 3. Removes folderPath from required fields (makes it optional)
 * @param spec - OpenAPI specification to fix
 * @returns Specification with corrected files endpoint schema
 */
function fixUploadFilesSchema(spec: OpenAPISpec): OpenAPISpec {
  const fixed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  // Find the /files GET endpoint response schema
  const filesPath = fixed.paths['/files']
  if (filesPath && typeof filesPath === 'object') {
    const getOp = (filesPath as Record<string, unknown>).get
    if (getOp && typeof getOp === 'object') {
      const responses = (getOp as Record<string, unknown>).responses
      if (responses && typeof responses === 'object') {
        const response200 = (responses as Record<string, unknown>)['200']
        if (response200 && typeof response200 === 'object') {
          const content = (response200 as Record<string, unknown>).content
          if (content && typeof content === 'object') {
            const jsonContent = (content as Record<string, unknown>)['application/json']
            if (jsonContent && typeof jsonContent === 'object') {
              const schema = (jsonContent as Record<string, unknown>).schema
              if (schema && typeof schema === 'object') {
                const schemaObj = schema as Record<string, unknown>
                // Schema is array of file items
                if (schemaObj.items && typeof schemaObj.items === 'object') {
                  const items = schemaObj.items as Record<string, unknown>
                  if (items.properties && typeof items.properties === 'object') {
                    const properties = items.properties as Record<string, unknown>

                    // Add publishedAt field
                    properties.publishedAt = {
                      anyOf: [
                        {
                          type: 'string',
                          format: 'date-time',
                          description:
                            'Timestamp when this file was published. Part of Strapi Draft & Publish feature.',
                          example: '2025-12-03T09:13:26.134Z',
                        },
                        { type: 'null' },
                      ],
                    }

                    // Add isUrlSigned field
                    properties.isUrlSigned = {
                      type: 'boolean',
                      description: 'Whether the file URL is signed (for private files)',
                    }

                    // Remove folderPath from required array
                    if (items.required && Array.isArray(items.required)) {
                      items.required = items.required.filter((field: unknown) => field !== 'folderPath')
                    }

                    // Make folderPath optional by allowing null
                    if (properties.folderPath && typeof properties.folderPath === 'object') {
                      properties.folderPath = {
                        anyOf: [
                          { type: 'string', description: 'Path to the folder containing this file' },
                          { type: 'null' },
                        ],
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Fix /files/{id} GET endpoint as well
  const fileByIdPath = fixed.paths['/files/{id}']
  if (fileByIdPath && typeof fileByIdPath === 'object') {
    const getOp = (fileByIdPath as Record<string, unknown>).get
    if (getOp && typeof getOp === 'object') {
      const responses = (getOp as Record<string, unknown>).responses
      if (responses && typeof responses === 'object') {
        const response200 = (responses as Record<string, unknown>)['200']
        if (response200 && typeof response200 === 'object') {
          const content = (response200 as Record<string, unknown>).content
          if (content && typeof content === 'object') {
            const jsonContent = (content as Record<string, unknown>)['application/json']
            if (jsonContent && typeof jsonContent === 'object') {
              const schema = (jsonContent as Record<string, unknown>).schema
              if (schema && typeof schema === 'object') {
                const schemaObj = schema as Record<string, unknown>
                if (schemaObj.properties && typeof schemaObj.properties === 'object') {
                  const properties = schemaObj.properties as Record<string, unknown>

                  // Add publishedAt field
                  properties.publishedAt = {
                    anyOf: [
                      {
                        type: 'string',
                        format: 'date-time',
                        description: 'Timestamp when this file was published. Part of Strapi Draft & Publish feature.',
                        example: '2025-12-03T09:13:26.134Z',
                      },
                      { type: 'null' },
                    ],
                  }

                  // Add isUrlSigned field
                  properties.isUrlSigned = {
                    type: 'boolean',
                    description: 'Whether the file URL is signed (for private files)',
                  }

                  // Remove folderPath from required array
                  if (schemaObj.required && Array.isArray(schemaObj.required)) {
                    schemaObj.required = (schemaObj.required as unknown[]).filter(
                      (field: unknown) => field !== 'folderPath'
                    )
                  }

                  // Make folderPath optional by allowing null
                  if (properties.folderPath && typeof properties.folderPath === 'object') {
                    properties.folderPath = {
                      anyOf: [
                        { type: 'string', description: 'Path to the folder containing this file' },
                        { type: 'null' },
                      ],
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return fixed
}

/**
 * Make 'related' field optional in PluginUploadFileDocument schema.
 *
 * Strapi automatically includes 'related' in the file schema as required,
 * but when using specific field selection in populate queries (e.g.,
 * `populate[image][fields]=url,name`), Strapi doesn't return the 'related' field.
 * This causes Pydantic validation errors with `extra=forbid` models.
 *
 * This function:
 * 1. Removes 'related' from the required array in PluginUploadFileDocument
 * @param spec - OpenAPI specification to fix
 * @returns Specification with 'related' made optional
 */
function makeRelatedOptionalInFileSchema(spec: OpenAPISpec): OpenAPISpec {
  const fixed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  if (fixed.components?.schemas) {
    const fileSchema = fixed.components.schemas.PluginUploadFileDocument as Record<string, unknown> | undefined
    if (fileSchema?.required && Array.isArray(fileSchema.required)) {
      // Remove 'related' from required array
      fileSchema.required = (fileSchema.required as string[]).filter(field => field !== 'related')
    }
  }

  return fixed
}

/**
 * Add slug-based endpoints to the specification.
 *
 * Duplicates /products/{id} -> /products/slug/{slug} (and for other content types)
 * to document the slug-based lookup endpoints added via custom routes.
 * @param spec - OpenAPI specification to modify
 * @returns Specification with slug endpoints added
 */
function addSlugEndpoints(spec: OpenAPISpec): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec
  const contentTypes = ['products', 'contributors', 'blog-posts', 'product-categories']

  contentTypes.forEach(contentType => {
    const idPathKey = `/${contentType}/{id}`
    const slugPathKey = `/${contentType}/slug/{slug}`

    // Check if ID path exists
    if (processed.paths[idPathKey]) {
      const idPathItem = processed.paths[idPathKey] as Record<string, unknown>
      const slugPathItem: Record<string, unknown> = {}

      // Copy operations (GET)
      if (typeof idPathItem.get === 'object') {
        const getOp = JSON.parse(JSON.stringify(idPathItem.get)) as Record<string, unknown>

        // Update operationId
        if (typeof getOp.operationId === 'string') {
          getOp.operationId = getOp.operationId.replace('_by_id', '_by_slug')
        } else {
          // Fallback if no operationId or different format
          const singular = contentType.replace(/s$/, '') // simple plural to singular
          getOp.operationId = `${singular}/get/${contentType}_by_slug`
        }

        // Update parameters: replace 'id' with 'slug'
        if (Array.isArray(getOp.parameters)) {
          getOp.parameters = getOp.parameters.map((param: unknown) => {
            const p = param as Record<string, unknown>
            if (p.name === 'id' && p.in === 'path') {
              return {
                name: 'slug',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                  description: 'The unique slug identifier',
                },
              }
            }
            return p
          })
        }

        // Add to slug path item
        slugPathItem.get = getOp
      }

      // Add new path to spec
      processed.paths[slugPathKey] = slugPathItem
    }
  })

  return processed
}

// ============================================================================
// Component Schema Generation
// ============================================================================

/**
 * Strapi component attribute definition.
 */
interface StrapiComponentAttribute {
  type: string
  component?: string
  repeatable?: boolean
  required?: boolean
  enum?: string[]
  multiple?: boolean
  allowedTypes?: string[]
  relation?: string
  target?: string
}

/**
 * Strapi component JSON schema definition.
 */
interface StrapiComponentSchema {
  collectionName: string
  info: {
    displayName: string
    icon?: string
    description?: string
  }
  options?: Record<string, unknown>
  attributes: Record<string, StrapiComponentAttribute>
}

/**
 * Convert a Strapi attribute to an OpenAPI property schema.
 * @param attr - Strapi attribute definition
 * @returns OpenAPI property schema
 */
function strapiAttributeToOpenAPIProperty(attr: StrapiComponentAttribute): Record<string, unknown> {
  switch (attr.type) {
    case 'string':
    case 'text':
    case 'richtext':
    case 'uid':
      return { type: 'string', description: `A ${attr.type} field` }

    case 'integer':
    case 'biginteger':
      return { type: 'integer', description: 'An integer field' }

    case 'decimal':
    case 'float':
      return { type: 'number', description: 'A number field' }

    case 'boolean':
      return { type: 'boolean', description: 'A boolean field' }

    case 'enumeration':
      return {
        type: 'string',
        enum: attr.enum ?? [],
        description: 'An enumeration field',
      }

    case 'media':
      return {
        description: 'A media field',
        $ref: '#/components/schemas/PluginUploadFileDocument',
      }

    case 'component':
      if (attr.component) {
        const schemaRef = componentNameToSchemaRef(attr.component)
        if (attr.repeatable) {
          return {
            type: 'array',
            items: { $ref: `#/components/schemas/${schemaRef}` },
            description: 'A repeatable component field',
          }
        }
        return {
          description: 'A component field',
          $ref: `#/components/schemas/${schemaRef}`,
        }
      }
      return { type: 'object', description: 'A component field' }

    case 'relation': {
      // Convert Strapi target (e.g., "api::product.product") to schema ref (e.g., "ApiProductProductDocument")
      // Also handles hyphenated names: "api::product-category.product-category" -> "ApiProductCategoryProductCategoryDocument"
      let targetRef = 'object'
      if (attr.target) {
        // api::product.product -> ApiProductProductDocument
        const parts = attr.target.split('::')
        if (parts.length === 2) {
          const [, contentType] = parts
          // product.product -> ProductProduct -> ApiProductProductDocument
          // product-category.product-category -> ProductCategoryProductCategory -> ApiProductCategoryProductCategoryDocument
          const typeParts = contentType?.split('.') ?? []
          const schemaName =
            'Api' +
            typeParts
              .map(p =>
                p
                  .split('-')
                  .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
                  .join('')
              )
              .join('') +
            'Document'
          targetRef = schemaName
        }
      }

      // oneToMany and manyToMany relations return arrays
      const isArrayRelation = attr.relation === 'oneToMany' || attr.relation === 'manyToMany'

      if (isArrayRelation) {
        return {
          type: 'array',
          items: targetRef !== 'object' ? { $ref: `#/components/schemas/${targetRef}` } : { type: 'object' },
          description: 'A relational field',
        }
      }
      // oneToOne and manyToOne relations return single object
      return targetRef !== 'object'
        ? { $ref: `#/components/schemas/${targetRef}`, description: 'A relational field' }
        : { type: 'object', description: 'A relational field' }
    }

    case 'json':
      return { type: 'object', description: 'A JSON field' }

    default:
      return { type: 'object', description: `An unknown field type: ${attr.type}` }
  }
}

/**
 * Generate OpenAPI schema from a Strapi component JSON file.
 * @param componentPath - Path to the component JSON file
 * @returns Tuple of [schemaName, schemaObject] or null if failed
 */
function generateSchemaFromComponent(componentPath: string): [string, Record<string, unknown>] | null {
  try {
    const content = fs.readFileSync(componentPath, 'utf-8')
    const component = JSON.parse(content) as StrapiComponentSchema

    // Extract component category and name from path
    // e.g., /path/to/sections/hero.json -> sections.hero -> SectionsHeroEntry
    const pathParts = componentPath.split(path.sep)
    const fileName = pathParts[pathParts.length - 1]?.replace('.json', '') ?? ''
    const category = pathParts[pathParts.length - 2] ?? ''
    if (!fileName || !category) return null
    const componentName = `${category}.${fileName}`
    const schemaName = componentNameToSchemaRef(componentName)

    // Build properties and required array
    const properties: Record<string, unknown> = {
      id: { type: 'integer', description: 'Component instance ID' },
    }
    const required: string[] = ['id']

    for (const [attrName, attr] of Object.entries(component.attributes)) {
      properties[attrName] = strapiAttributeToOpenAPIProperty(attr)
      if (attr.required) {
        required.push(attrName)
      }
    }

    const schema: Record<string, unknown> = {
      type: 'object',
      description: component.info.description ?? component.info.displayName,
      properties,
      required,
      additionalProperties: false,
    }

    return [schemaName, schema]
  } catch {
    return null
  }
}

/**
 * Generate missing component schemas from Strapi component JSON files.
 *
 * Scans sections/ and call-to-actions/ directories and generates OpenAPI
 * schemas for any components not already in the spec.
 * @param spec - OpenAPI specification to enhance
 * @param componentsDir - Path to cms/src/components directory
 * @returns Enhanced specification with generated component schemas
 */
function generateMissingComponentSchemas(spec: OpenAPISpec, componentsDir: string): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec

  processed.components ??= {}
  processed.components.schemas ??= {}

  const existingSchemas = new Set(Object.keys(processed.components.schemas))
  const categoriesToScan = ['sections', 'call-to-actions', 'markers', 'elements', 'menus']
  let generatedCount = 0

  for (const category of categoriesToScan) {
    const categoryDir = path.join(componentsDir, category)

    try {
      const files = fs.readdirSync(categoryDir)

      for (const file of files) {
        if (!file.endsWith('.json')) continue

        const componentPath = path.join(categoryDir, file)
        const result = generateSchemaFromComponent(componentPath)

        if (result) {
          const [schemaName, schema] = result

          if (!existingSchemas.has(schemaName)) {
            processed.components.schemas[schemaName] = schema
            generatedCount++
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read, skip
    }
  }

  console.log(`   ✓ Generated ${String(generatedCount)} missing component schema(s)`)

  return processed
}

// ============================================================================
// Dynamic Zone Type Enhancement
// ============================================================================

/**
 * Mapping of dynamic zone field names to their allowed component types.
 *
 * Extracted from contentTypes.d.ts DynamicZone definitions.
 */
interface DynamicZoneMapping {
  /** Map of fieldName to array of component type names (e.g., 'elements.text-block') */
  fields: Map<string, string[]>
  /** Map of content type to their dynamic zone field names */
  contentTypes: Map<string, string[]>
}

/**
 * Convert Strapi component name to OpenAPI schema reference name.
 *
 * Transforms component names like 'elements.text-block' to PascalCase
 * schema names like 'ElementsTextBlockEntry'.
 * @param componentName - Strapi component name (e.g., 'elements.text-block')
 * @returns OpenAPI schema name (e.g., 'ElementsTextBlockEntry')
 */
function componentNameToSchemaRef(componentName: string): string {
  // Split by dots and hyphens, convert to PascalCase, join, add Entry suffix
  return (
    componentName
      .split(/[.-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('') + 'Entry'
  )
}

/**
 * Parse contentTypes.d.ts to extract DynamicZone component type mappings.
 *
 * Reads the TypeScript declaration file and extracts all DynamicZone<[...]>
 * definitions, mapping field names to their allowed component types.
 * @param contentTypesPath - Path to cms/types/generated/contentTypes.d.ts
 * @returns Mapping of field names to component types
 */
function parseDynamicZoneTypes(contentTypesPath: string): DynamicZoneMapping {
  const fields = new Map<string, string[]>()
  const contentTypes = new Map<string, string[]>()

  try {
    const content = fs.readFileSync(contentTypesPath, 'utf-8')
    const lines = content.split('\n')

    let currentInterface: string | null = null
    let inDynamicZone = false
    let dynamicZoneFieldName: string | null = null
    let componentsList: string[] = []
    let bracketDepth = 0

    for (const line of lines) {
      // Track current interface (content type)
      const interfaceMatch = /^export interface (Api\w+) extends/.exec(line)
      if (interfaceMatch?.[1]) {
        currentInterface = interfaceMatch[1]
        continue
      }

      // Start of DynamicZone field
      const dzStartMatch = /^\s+(\w+): Schema\.Attribute\.DynamicZone</.exec(line)
      if (dzStartMatch?.[1]) {
        inDynamicZone = true
        dynamicZoneFieldName = dzStartMatch[1]
        componentsList = []
        bracketDepth = (line.match(/\[/g) ?? []).length - (line.match(/\]/g) ?? []).length
        continue
      }

      // Inside DynamicZone definition
      if (inDynamicZone) {
        // Extract component names from array literals
        const componentMatches = Array.from(line.matchAll(/'([a-z-]+\.[a-z-]+)'/g))
        for (const match of componentMatches) {
          if (match[1]) {
            componentsList.push(match[1])
          }
        }

        // Track bracket depth
        bracketDepth += (line.match(/\[/g) ?? []).length
        bracketDepth -= (line.match(/\]/g) ?? []).length

        // End of DynamicZone definition (closing bracket found)
        if (bracketDepth <= 0 || line.includes('>')) {
          if (dynamicZoneFieldName && componentsList.length > 0) {
            // Merge with existing components (don't overwrite)
            // This handles the same field name in different content types (e.g., About.sections vs Homepage.sections)
            const existingComponents = fields.get(dynamicZoneFieldName) ?? []
            const mergedComponents = [...new Set([...existingComponents, ...componentsList])]
            fields.set(dynamicZoneFieldName, mergedComponents)

            // Track which content type has this field
            if (currentInterface) {
              const existing = contentTypes.get(currentInterface) ?? []
              existing.push(dynamicZoneFieldName)
              contentTypes.set(currentInterface, existing)
            }
          }
          inDynamicZone = false
          dynamicZoneFieldName = null
          componentsList = []
        }
      }
    }

    console.log(`   ✓ Parsed ${String(fields.size)} dynamic zone field(s) from contentTypes.d.ts`)
    fields.forEach((components, field) => {
      console.log(`     - ${field}: ${String(components.length)} component type(s)`)
    })
  } catch {
    console.warn('   ⚠ Could not parse contentTypes.d.ts, dynamic zones will remain untyped')
  }

  return { fields, contentTypes }
}

/**
 * Enhance dynamic zone schemas with discriminated union types.
 *
 * Traverses the OpenAPI spec and replaces `items: {}` for dynamic zones
 * with `anyOf` containing references to the allowed component schemas,
 * each with a `__component` discriminator property.
 * @param spec - OpenAPI specification to enhance
 * @param dynamicZoneMapping - Mapping of field names to component types
 * @returns Enhanced specification with typed dynamic zones
 */
function enhanceDynamicZoneSchemas(spec: OpenAPISpec, dynamicZoneMapping: DynamicZoneMapping): OpenAPISpec {
  const processed = JSON.parse(JSON.stringify(spec)) as OpenAPISpec
  let enhancedCount = 0

  // Get set of existing schema names for validation
  const existingSchemas = new Set(Object.keys(processed.components?.schemas ?? {}))

  /**
   * Build anyOf schema for a dynamic zone field.
   * Only includes components that have schemas in the spec.
   * @param componentTypes - Array of component type names
   * @returns anyOf schema with discriminated unions, or null if no valid components
   */
  function buildAnyOfSchema(componentTypes: string[]): Record<string, unknown> | null {
    const validComponents = componentTypes.filter(componentName => {
      const schemaName = componentNameToSchemaRef(componentName)
      return existingSchemas.has(schemaName)
    })

    if (validComponents.length === 0) {
      return null
    }

    // Build discriminator mapping: component name -> schema ref
    const mapping: Record<string, string> = {}
    for (const componentName of validComponents) {
      mapping[componentName] = `#/components/schemas/${componentNameToSchemaRef(componentName)}`
    }

    return {
      // OpenAPI 3.0 discriminator for proper union type handling
      discriminator: {
        propertyName: '__component',
        mapping,
      },
      anyOf: validComponents.map(componentName => ({
        allOf: [
          { $ref: `#/components/schemas/${componentNameToSchemaRef(componentName)}` },
          {
            type: 'object',
            properties: {
              __component: {
                type: 'string',
                const: componentName,
                description: 'Component type discriminator',
              },
            },
            required: ['__component'],
          },
        ],
      })),
    }
  }

  /**
   * Recursively traverse and enhance dynamic zone schemas.
   * @param obj - Object to traverse
   * @param parentKey - Parent property key for context
   */
  function traverse(obj: unknown, parentKey?: string): void {
    if (!obj || typeof obj !== 'object') return

    const record = obj as Record<string, unknown>

    // Check if this is an array property with items (dynamic zone candidate)
    if (record.type === 'array' && record.items !== undefined && typeof record.items === 'object' && parentKey) {
      const items = record.items as Record<string, unknown>
      const componentTypes = dynamicZoneMapping.fields.get(parentKey)

      // Case 1: Empty items - create new anyOf schema
      if (Object.keys(items).length === 0 && componentTypes && componentTypes.length > 0) {
        const anyOfSchema = buildAnyOfSchema(componentTypes)
        if (anyOfSchema) {
          record.items = anyOfSchema
          enhancedCount++
        }
      }
      // Case 2: Existing anyOf with discriminator - update with merged components
      else if (items.anyOf && items.discriminator && componentTypes && componentTypes.length > 0) {
        const anyOfSchema = buildAnyOfSchema(componentTypes)
        if (anyOfSchema) {
          record.items = anyOfSchema
          enhancedCount++
        }
      }
    }

    // Recursively process all nested objects
    for (const [key, value] of Object.entries(record)) {
      if (Array.isArray(value)) {
        value.forEach(item => {
          traverse(item, key)
        })
      } else if (value && typeof value === 'object') {
        traverse(value, key)
      }
    }
  }

  // Traverse paths (response schemas)
  traverse(processed.paths)

  // Traverse component schemas
  if (processed.components?.schemas) {
    traverse(processed.components.schemas)
  }

  console.log(`   ✓ Enhanced ${String(enhancedCount)} dynamic zone field(s) with discriminated unions`)

  return processed
}

// ============================================================================
// File I/O Layer
// ============================================================================

/**
 * Read and parse an OpenAPI specification from a YAML file.
 * @param filePath - Absolute path to the OpenAPI YAML file
 * @returns Parsed OpenAPI specification object
 */
function readOpenAPISpec(filePath: string): OpenAPISpec {
  const content = fs.readFileSync(filePath, 'utf-8')
  return yaml.load(content) as OpenAPISpec
}

/**
 * Sort paths and tags in OpenAPI specification alphabetically.
 * @param spec - OpenAPI specification object to sort
 * @returns Sorted specification with paths and tags in alphabetical order
 */
function sortOpenAPISpec(spec: OpenAPISpec): OpenAPISpec {
  const sorted = { ...spec }

  // Sort paths alphabetically
  const sortedPaths: Record<string, unknown> = {}
  Object.keys(sorted.paths)
    .sort()
    .forEach(key => {
      sortedPaths[key] = sorted.paths[key]
    })
  sorted.paths = sortedPaths

  // Sort tags alphabetically by name
  if (sorted.tags) {
    sorted.tags = [...sorted.tags].sort((a, b) => {
      const nameA = (a as { name?: string }).name ?? ''
      const nameB = (b as { name?: string }).name ?? ''
      return nameA.localeCompare(nameB)
    })
  }

  return sorted
}

/**
 * Generate YAML header comment with copyright and autogeneration warning.
 * @param copyrightText - Copyright text to include
 * @returns YAML comment header string
 */
function generateYAMLHeader(copyrightText: string): string {
  return `# ${copyrightText}
#
# WARNING: This file is autogenerated by cms/scripts/merge-openapi.ts
# DO NOT MODIFY THIS FILE DIRECTLY - changes will be overwritten
# To make changes, edit contracts/template.openapi.yaml or the CMS content types

`
}

/**
 * Write an OpenAPI specification to a YAML file.
 * @param filePath - Absolute path where the YAML file should be written
 * @param spec - OpenAPI specification object to serialize
 * @param options - Optional configuration
 * @param options.addHeader - Whether to add copyright header and autogeneration warning
 */
function writeOpenAPISpec(filePath: string, spec: OpenAPISpec, options?: { addHeader?: boolean }): void {
  const sortedSpec = sortOpenAPISpec(spec)
  const yamlContent = yaml.dump(sortedSpec, {
    lineWidth: -1, // Prevent line wrapping
    indent: 2,
    noCompatMode: true,
  })

  let finalContent = yamlContent
  if (options?.addHeader) {
    const copyrightText = fs.readFileSync(path.resolve(__dirname, '../../.copyright-header.txt'), 'utf-8').trim()
    const header = generateYAMLHeader(copyrightText)
    finalContent = header + yamlContent
  }

  fs.writeFileSync(filePath, finalContent, 'utf-8')
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
 * - Remove components paths (/components and /components/{uid})
 * - Remove locales paths (/locales)
 * - Remove content-type-builder tag
 * - Remove i18n tag
 * - Add server URLs for Strapi CMS endpoints
 * - Fix pattern fields with unsupported regex features (email, UUID, etc.)
 * - Remove $id fields from schemas
 * - Remove UUID format fields
 * - Add id property to component schemas (Strapi components always include id)
 * - Add meta field to all response schemas
 * - Add license information to info section
 * - Add tags section with descriptions
 * - Fix populate parameter schemas with empty enum arrays
 * - Add 200 responses to operations missing success responses
 * - Add security definitions to mark operations as public
 * - Fix upload files schema to match actual Strapi 5 response
 * - Make 'related' optional in PluginUploadFileDocument (for field-specific populate)
 * @param spec - Raw Strapi OpenAPI specification
 * @param config - Configuration with server URLs
 * @param config.strapiUrlProd - Production Strapi URL
 * @param config.strapiUrlDev - Development Strapi URL
 * @returns Preprocessed specification
 */
function preprocessStrapiSpec(spec: OpenAPISpec, config: { strapiUrlProd: string; strapiUrlDev: string }): OpenAPISpec {
  let processed = spec

  // 1. Remove write operations
  processed = removeWriteOperations(processed)

  // 2. Remove content-type-builder paths
  processed = removeContentTypesPaths(processed)

  // 3. Remove components paths
  processed = removeComponentsPaths(processed)

  // 4. Remove locales paths
  processed = removeLocalesPaths(processed)

  // 5. Remove content-type-builder tag
  processed = removeContentTypeBuilderTag(processed)

  // 6. Remove i18n tag
  processed = removeI18nTag(processed)

  // 7. Remove plugin paths (cms/src/plugins endpoints)
  processed = removePluginPaths(processed)

  // 8. Remove plugin tags
  processed = removePluginTags(processed)

  // 9. Add server URLs for Strapi CMS endpoints
  processed = addStrapiServers(processed, config.strapiUrlProd, config.strapiUrlDev)

  // 10. Fix pattern fields with unsupported regex features
  processed = fixStrapiPatterns(processed)

  // 11. Remove $id fields from schemas
  processed = removeSchemaIds(processed)

  // 12. Remove UUID format fields
  processed = removeUuidFormat(processed)

  // 13. Remove publishedAt default values
  processed = removePublishedAtDefaults(processed)

  // 14. Fix empty populate enums
  processed = fixEmptyPopulateEnums(processed)

  // 15. Replace populate with nested-populator parameters
  processed = replacePopulateWithNestedPopulator(processed)

  // 16. Add generic 200 responses where missing
  processed = addMissing200Responses(processed)

  // 17. Fix upload files endpoint schema
  processed = fixUploadFilesSchema(processed)

  // 18. Add id to component schemas
  processed = addIdToComponentSchemas(processed)

  // 19. Add meta to responses
  processed = addMetaToResponses(processed)

  // 20. Add license information to info section
  processed = addStrapiLicense(processed)

  // 21. Add tags section with descriptions
  processed = addStrapiTags(processed)

  // 22. Add security definitions to mark operations as public
  processed = addPublicSecurity(processed)

  // 23. Remove deprecated 'related' field from PluginUploadFileDocument required array
  processed = makeRelatedOptionalInFileSchema(processed)

  // 24. Simplify localizations schema to avoid Pydantic validation errors
  // Strapi returns localizations as shallow refs (scalar fields only, no components)
  processed = simplifyLocalizationsSchema(processed)

  return processed
}

// ============================================================================
// Merging Layer
// ============================================================================

/**
 * Merge paths from template and Strapi specifications.
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

/**
 * Add missing descriptions to operations based on tags and HTTP method.
 *
 * Generates human-readable descriptions for operations that don't have one,
 * using the tag name and HTTP method to create meaningful text. This ensures
 * all routes in the API documentation have descriptions.
 * @param spec - OpenAPI specification to enhance
 * @returns Enhanced specification with descriptions added
 */
function addMissingDescriptions(spec: OpenAPISpec): OpenAPISpec {
  const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']
  let descriptionCount = 0

  /**
   * Format tag name for display in descriptions.
   * Converts kebab-case to Title Case with proper word separation.
   * @param tag - The tag name to format (e.g., "blog-post")
   * @returns Formatted tag name (e.g., "Blog Post")
   */
  const formatTagName = (tag: string): string => {
    return tag
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  /**
   * Generate description based on HTTP method and tag name.
   * @param method - HTTP method (get, post, put, etc.)
   * @param tagName - The tag/resource name
   * @param path - The API path for context
   * @returns Generated description string
   */
  const generateDescription = (method: string, tagName: string, path: string): string => {
    const formattedTag = formatTagName(tagName)

    // Check if path has a parameter (e.g., /products/{documentId})
    const hasPathParam = path.includes('{')
    const isSingular = hasPathParam || !path.endsWith('s')

    const methodDescriptions: Record<string, (tag: string, singular: boolean) => string> = {
      get: (tag, singular) =>
        singular
          ? `Retrieves ${tag} content from the CMS. Supports field selection, population, and localization.`
          : `Retrieves a list of ${tag} entries from the CMS. Supports filtering, pagination, and sorting.`,
      post: tag => `Creates a new ${tag} entry in the CMS.`,
      put: tag => `Updates an existing ${tag} entry in the CMS.`,
      patch: tag => `Partially updates a ${tag} entry in the CMS.`,
      delete: tag => `Deletes a ${tag} entry from the CMS.`,
      options: tag => `Returns available HTTP methods for ${tag} endpoint.`,
      head: tag => `Returns headers for ${tag} endpoint without body.`,
      trace: tag => `Echoes the received request for ${tag} endpoint (debugging).`,
    }

    const descGen = methodDescriptions[method]
    if (descGen) {
      return typeof descGen === 'function' && descGen.length === 2
        ? (descGen as (tag: string, singular: boolean) => string)(formattedTag, isSingular)
        : (descGen as (tag: string) => string)(formattedTag)
    }

    return `Performs a ${method.toUpperCase()} operation on ${formattedTag}.`
  }

  Object.entries(spec.paths).forEach(([path, pathItem]: [string, unknown]) => {
    if (pathItem && typeof pathItem === 'object') {
      HTTP_METHODS.forEach(method => {
        const operation = (pathItem as Record<string, unknown>)[method]
        if (operation && typeof operation === 'object') {
          const op = operation as Record<string, unknown>
          if (!op.description) {
            const tags = op.tags as string[] | undefined
            const tagName = tags?.[0] ?? 'resource'

            op.description = generateDescription(method, tagName, path)
            descriptionCount++
          }
        }
      })
    }
  })

  console.log(`   ✓ Added ${descriptionCount.toString()} missing descriptions`)
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
  const strapiDir = path.resolve(__dirname, '..')
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

    // Add slug endpoints
    console.log('🔧 Adding slug-based endpoints...')
    strapi = addSlugEndpoints(strapi)
    console.log('✅ Slug endpoints added (/products/slug/{slug}, etc.)')

    // Generate missing component schemas for sections and CTAs
    console.log('🔧 Generating missing component schemas...')
    const componentsDir = path.join(strapiDir, 'src', 'components')
    strapi = generateMissingComponentSchemas(strapi, componentsDir)

    // Enhance dynamic zones with discriminated union types
    console.log('🔧 Enhancing dynamic zone schemas...')
    const contentTypesPath = path.join(strapiDir, 'types', 'generated', 'contentTypes.d.ts')
    const dynamicZoneMapping = parseDynamicZoneTypes(contentTypesPath)
    strapi = enhanceDynamicZoneSchemas(strapi, dynamicZoneMapping)
    console.log('✅ Dynamic zone schemas enhanced with discriminated unions')

    // Inject missing filter keys (e.g., roles for contributors)
    console.log('🔧 Adding relational fields to filters...')
    strapi = addRelationalFieldsToFilters(strapi)
    console.log('✅ Relational fields added to filters')

    // Enrich Strapi spec with metadata
    console.log('✨ Enriching Strapi spec with metadata...')
    strapi = enrichWithMetadata(strapi, StrapiMetadataDefaults.getDefaults())
    console.log('✅ Strapi spec enriched')

    // Add missing summaries and descriptions to operations
    console.log('📝 Adding summaries and descriptions to Strapi operations...')
    strapi = addMissingSummaries(strapi)
    strapi = addMissingDescriptions(strapi)

    // Write the updated Strapi spec back to the file
    console.log('✍️  Updating Strapi specification file...')
    writeOpenAPISpec(strapiPath, strapi)
    console.log(`✅ Updated: ${strapiPath}`)

    // Remove health check paths for merging (keep them in strapi.openapi.yaml for validation)
    console.log('🔧 Removing health check paths for backend API...')
    const strapiForMerge = removeHealthCheckPaths(strapi)
    console.log('✅ Health check paths removed (/health, /health/ready)')

    // Merge specifications
    console.log('🔀 Merging paths...')
    const mergedPaths = mergePaths(template, strapiForMerge)
    console.log(`   ✓ Template paths: ${Object.keys(template.paths).length.toString()}`)
    console.log(`   ✓ Strapi paths: ${Object.keys(strapiForMerge.paths).length.toString()}`)
    console.log(`   ✓ Merged total: ${Object.keys(mergedPaths).length.toString()}`)

    console.log('🔀 Merging components...')
    const mergedComponents = mergeComponents(template, strapiForMerge)
    const templateSchemaCount = Object.keys(template.components?.schemas ?? {}).length
    const strapiSchemaCount = Object.keys(strapiForMerge.components?.schemas ?? {}).length
    const mergedSchemaCount = Object.keys(mergedComponents.schemas).length

    console.log(`   ✓ Template schemas: ${templateSchemaCount.toString()}`)
    console.log(`   ✓ Strapi schemas: ${strapiSchemaCount.toString()}`)
    console.log(`   ✓ Merged total: ${mergedSchemaCount.toString()}`)

    console.log('🔀 Merging tags...')
    const mergedTags = mergeTags(template, strapiForMerge)
    const templateTagCount = template.tags?.length ?? 0
    const strapiTagCount = strapiForMerge.tags?.length ?? 0
    console.log(`   ✓ Template tags: ${templateTagCount.toString()}`)
    console.log(`   ✓ Strapi tags: ${strapiTagCount.toString()}`)
    console.log(`   ✓ Merged total: ${mergedTags.length.toString()}`)

    // Build merged spec
    console.log('🏗️  Building merged specification...')
    let merged = buildMergedSpec(template, mergedPaths, mergedComponents, mergedTags, {
      backendUrlProd,
      backendUrlDev,
    })

    // Enhance with missing summaries and descriptions
    console.log('📝 Adding missing summaries and descriptions to operations...')
    merged = addMissingSummaries(merged)
    merged = addMissingDescriptions(merged)

    // Enrich with metadata
    console.log('✨ Enriching with metadata (descriptions, examples)...')
    merged = enrichWithMetadata(merged, StrapiMetadataDefaults.getDefaults())
    console.log('✅ Metadata enrichment complete')

    // Write merged spec
    console.log('✍️  Writing merged specification...')
    writeOpenAPISpec(outputPath, merged, { addHeader: true })
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
