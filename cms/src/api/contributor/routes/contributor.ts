// Copyright (c) 2026 Affilibuster by Ronen Druker.

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

export default factories.createCoreRouter('api::contributor.contributor', getProductionOnlyConfig(['find', 'findOne']))
