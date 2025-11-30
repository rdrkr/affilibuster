// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

export default factories.createCoreRouter('api::error-404.error-404', getProductionOnlyConfig(['find']))
