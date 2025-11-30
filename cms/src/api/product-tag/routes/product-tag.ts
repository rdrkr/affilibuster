// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * product-tag router
 */

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

export default factories.createCoreRouter('api::product-tag.product-tag', getProductionOnlyConfig(['find', 'findOne']))
