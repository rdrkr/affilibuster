// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { factories } from '@strapi/strapi'

export default factories.createCoreRouter('api::error-410.error-410', {
  only: ['find'],
})
