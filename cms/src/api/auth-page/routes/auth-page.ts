// Copyright (c) 2025 Affilibuster by Ronen Druker.

import { factories } from '@strapi/strapi'
import { getProductionOnlyConfig } from '../../../utils/route-config'

/**
 * Router for auth page labels content.
 *
 * Uses `/auth-page` endpoint (from folder name) to avoid confusion
 * with actual authentication endpoints at `/auth` (login, register, etc.).
 */
export default factories.createCoreRouter('api::auth-page.auth-page', getProductionOnlyConfig(['find']))
