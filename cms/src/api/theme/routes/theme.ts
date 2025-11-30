// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * theme router
 */

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

export default factories.createCoreRouter('api::theme.theme', getProductionOnlyConfig(['find', 'findOne']))
