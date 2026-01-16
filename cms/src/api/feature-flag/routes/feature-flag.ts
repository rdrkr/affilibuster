// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

export default factories.createCoreRouter(
  'api::feature-flag.feature-flag',
  getProductionOnlyConfig(['find', 'findOne'])
)
