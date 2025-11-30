// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * blog-post-tag router
 */

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

export default factories.createCoreRouter(
  'api::blog-post-tag.blog-post-tag',
  getProductionOnlyConfig(['find', 'findOne'])
)
