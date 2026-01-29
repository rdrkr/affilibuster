// Copyright (c) 2026 Affilibuster by Ronen Druker.

import type { Core } from '@strapi/strapi'

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  index(ctx: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    ctx.body = strapi
      .plugin('strapi-plugin-relation-filter')
      // the name of the service file & the method.
      .service('service')
      .getFiltersForAttribute('api::blog-post.blog-post', 'contributor')
  },
})

export default controller
