import type { Schema, Struct } from '@strapi/strapi'

export interface UiContactCard extends Struct.ComponentSchema {
  collectionName: 'components_ui_contact_cards'
  info: {
    description: 'A contact information card with title, description, and email'
    displayName: 'Contact Card'
    icon: 'mail'
  }
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required
    email: Schema.Attribute.Email & Schema.Attribute.Required
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface UiFeatureCard extends Struct.ComponentSchema {
  collectionName: 'components_ui_feature_cards'
  info: {
    description: 'A card with icon, title, and description for feature showcase'
    displayName: 'Feature Card'
    icon: 'square'
  }
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required
    linkUrl: Schema.Attribute.String
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface UiFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_ui_feature_items'
  info: {
    description: 'A feature item with title and description'
    displayName: 'Feature Item'
    icon: 'grid'
  }
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface UiPagination extends Struct.ComponentSchema {
  collectionName: 'components_ui_paginations'
  info: {
    description: 'Pagination text labels and messages'
    displayName: 'Pagination'
    icon: 'align-right'
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    nextButton: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.DefaultTo<'Next'>
    noItemsFound: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.DefaultTo<'No items found'>
    pageText: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.DefaultTo<'Page {current} of {total}'>
    previousButton: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.DefaultTo<'Previous'>
    showingText: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.DefaultTo<'Showing {count} of {total}'>
  }
}

export interface UiTrustCard extends Struct.ComponentSchema {
  collectionName: 'components_ui_trust_cards'
  info: {
    description: 'A trust/benefit card with title and description'
    displayName: 'Trust Card'
    icon: 'star'
  }
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'ui.contact-card': UiContactCard
      'ui.feature-card': UiFeatureCard
      'ui.feature-item': UiFeatureItem
      'ui.pagination': UiPagination
      'ui.trust-card': UiTrustCard
    }
  }
}
