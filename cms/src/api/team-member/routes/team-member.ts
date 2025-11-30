// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * team-member router
 */

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

export default factories.createCoreRouter('api::team-member.team-member', getProductionOnlyConfig(['find', 'findOne']))
