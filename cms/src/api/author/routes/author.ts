// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

export default factories.createCoreRouter('api::author.author', getProductionOnlyConfig(['find', 'findOne']))
