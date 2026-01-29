// Copyright (c) 2026 Affilibuster by Ronen Druker.

/**
 * product-certificate router
 */

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

export default factories.createCoreRouter(
  'api::product-certificate.product-certificate',
  getProductionOnlyConfig(['find', 'findOne'])
)
