import type { Schema, Struct } from '@strapi/strapi'

export interface CallToActionsCategoryCta extends Struct.ComponentSchema {
  collectionName: 'components_call_to_actions_category_ctas'
  info: {
    displayName: 'Category CTA'
    icon: 'database'
  }
  attributes: {
    button: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
    category: Schema.Attribute.Relation<'oneToOne', 'api::product-category.product-category'>
  }
}

export interface CallToActionsNewsletterSignupCta extends Struct.ComponentSchema {
  collectionName: 'components_call_to_actions_newsletter_signup_ctas'
  info: {
    displayName: 'Newsletter Signup CTA'
    icon: 'play'
  }
  attributes: {
    description: Schema.Attribute.String & Schema.Attribute.Required
    emailPlaceholder: Schema.Attribute.Component<'elements.label', false> & Schema.Attribute.Required
    submitButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface CallToActionsPaginationCta extends Struct.ComponentSchema {
  collectionName: 'components_call_to_actions_pagination_ctas'
  info: {
    displayName: 'Pagination CTA'
    icon: 'dashboard'
  }
  attributes: {
    itemsPerPage: Schema.Attribute.Integer & Schema.Attribute.Required
    nextButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
    noItemsFound: Schema.Attribute.Component<'elements.header', false> & Schema.Attribute.Required
    previousButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
  }
}

export interface ElementsButton extends Struct.ComponentSchema {
  collectionName: 'components_elements_buttons'
  info: {
    displayName: 'Button'
    icon: 'cursor'
  }
  attributes: {
    label: Schema.Attribute.Component<'elements.label', false>
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<false>
    url: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface ElementsHeader extends Struct.ComponentSchema {
  collectionName: 'components_elements_headers'
  info: {
    displayName: 'Header'
    icon: 'bulletList'
  }
  attributes: {
    alignment: Schema.Attribute.Enumeration<['center', 'language-direction']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'language-direction'>
    header: Schema.Attribute.Component<'elements.label', false>
    promoteHeaderIcon: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<false>
    subheader: Schema.Attribute.Component<'elements.label', false>
  }
}

export interface ElementsLabel extends Struct.ComponentSchema {
  collectionName: 'components_elements_labels'
  info: {
    displayName: 'Label'
    icon: 'italic'
  }
  attributes: {
    ariaDescription: Schema.Attribute.String & Schema.Attribute.Required
    icon: Schema.Attribute.String
    iconPosition: Schema.Attribute.Enumeration<['before_text', 'after_text']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'before_text'>
    text: Schema.Attribute.Text & Schema.Attribute.Required
  }
}

export interface ElementsSeoMetadata extends Struct.ComponentSchema {
  collectionName: 'components_elements_seo_metadata'
  info: {
    displayName: 'SEO Metadata'
    icon: 'alien'
  }
  attributes: {
    metaDescription: Schema.Attribute.String
    metaKeywords: Schema.Attribute.JSON
    metaTitle: Schema.Attribute.String
  }
}

export interface ElementsTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_elements_text_blocks'
  info: {
    displayName: 'Text Block'
    icon: 'file'
  }
  attributes: {
    content: Schema.Attribute.RichText
    header: Schema.Attribute.Component<'elements.header', false>
  }
}

export interface MarkersEndHorizontalLayoutMarker extends Struct.ComponentSchema {
  collectionName: 'components_markers_end_horizontal_layout_markers'
  info: {
    displayName: 'End Horizontal Layout Marker'
    icon: 'bulletList'
  }
  attributes: {}
}

export interface MarkersStartHorizontalLayoutMarker extends Struct.ComponentSchema {
  collectionName: 'components_markers_start_horizontal_layout_markers'
  info: {
    displayName: 'Start Horizontal Layout Marker'
    icon: 'bulletList'
  }
  attributes: {}
}

export interface MenusLanguageSelector extends Struct.ComponentSchema {
  collectionName: 'components_menus_language_selectors'
  info: {
    displayName: 'Language Menu'
    icon: 'earth'
  }
  attributes: {
    menuButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
  }
}

export interface MenusMobileMenu extends Struct.ComponentSchema {
  collectionName: 'components_menus_mobile_menus'
  info: {
    displayName: 'Mobile Menu'
    icon: 'phone'
  }
  attributes: {
    closeButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
    openButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
  }
}

export interface MenusProductCategoriesSelector extends Struct.ComponentSchema {
  collectionName: 'components_menus_product_categories_selectors'
  info: {
    displayName: 'Products Menu'
    icon: 'apps'
  }
  attributes: {
    menuButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
    productCategories: Schema.Attribute.Relation<'oneToMany', 'api::product-category.product-category'>
  }
}

export interface MenusSearchMenu extends Struct.ComponentSchema {
  collectionName: 'components_menus_search_menus'
  info: {
    displayName: 'Search Menu'
    icon: 'search'
  }
  attributes: {
    menuButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
    nowTrendingLabel: Schema.Attribute.Component<'elements.label', false> & Schema.Attribute.Required
    recentSearchesLabel: Schema.Attribute.Component<'elements.label', false> & Schema.Attribute.Required
    textBoxPlaceholderLabel: Schema.Attribute.Component<'elements.label', false> & Schema.Attribute.Required
    viewAllResultsButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
  }
}

export interface MenusThemeSelector extends Struct.ComponentSchema {
  collectionName: 'components_menus_theme_selectors'
  info: {
    displayName: 'Theme Menu'
    icon: 'sun'
  }
  attributes: {
    menuButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
    themes: Schema.Attribute.Relation<'oneToMany', 'api::theme.theme'>
  }
}

export interface SectionsBlogTeaser extends Struct.ComponentSchema {
  collectionName: 'components_sections_blog_teasers'
  info: {
    description: 'Section displaying blog post previews in grid'
    displayName: 'Blog Teaser Section'
    icon: 'gift'
  }
  attributes: {
    blog_posts: Schema.Attribute.Relation<'oneToMany', 'api::blog-post.blog-post'>
    header: Schema.Attribute.Component<'elements.header', false> & Schema.Attribute.Required
    viewAllButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
  }
}

export interface SectionsBrandFeaturesSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_brand_features_sections'
  info: {
    displayName: 'Brand Features Section'
    icon: 'command'
  }
  attributes: {
    features: Schema.Attribute.Component<'elements.header', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 4
          min: 1
        },
        number
      >
    headerAlignment: Schema.Attribute.Enumeration<['center', 'language-direction']> &
      Schema.Attribute.DefaultTo<'language-direction'>
    headerAriaDescription: Schema.Attribute.String
    headerIcon: Schema.Attribute.String
    headerText: Schema.Attribute.String
    learnMoreButtonAriaDescription: Schema.Attribute.String
    learnMoreButtonIcon: Schema.Attribute.String
    learnMoreButtonOpenInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>
    learnMoreButtonText: Schema.Attribute.String
    learnMoreButtonUrl: Schema.Attribute.String
    showHeader: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<false>
    subheaderAriaDescription: Schema.Attribute.String
    subheaderIcon: Schema.Attribute.String
    subheaderText: Schema.Attribute.String
  }
}

export interface SectionsCategoryGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_category_grids'
  info: {
    description: 'Grid of product categories with icons'
    displayName: 'Categories Section'
    icon: 'apps'
  }
  attributes: {
    categories: Schema.Attribute.Relation<'oneToMany', 'api::product-category.product-category'>
    header: Schema.Attribute.Component<'elements.header', false> & Schema.Attribute.Required
  }
}

export interface SectionsFeaturedProducts extends Struct.ComponentSchema {
  collectionName: 'components_sections_featured_products'
  info: {
    description: 'Section displaying featured products with header and view all link'
    displayName: 'Featured Products Section'
    icon: 'shoppingCart'
  }
  attributes: {
    header: Schema.Attribute.Component<'elements.header', false> & Schema.Attribute.Required
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>
    viewAllButton: Schema.Attribute.Component<'elements.button', false> & Schema.Attribute.Required
  }
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes'
  info: {
    description: 'Hero banner with title, subtitle, CTA, and background image'
    displayName: 'Hero Section'
    icon: 'picture'
  }
  attributes: {
    exploreButton: Schema.Attribute.Component<'elements.button', false>
    header: Schema.Attribute.Component<'elements.header', false> & Schema.Attribute.Required
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required
    variant: Schema.Attribute.Enumeration<['text-above-background', 'text-over-background', 'text-below-background']> &
      Schema.Attribute.Required
  }
}

export interface SectionsTeamGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_team_grids'
  info: {
    description: 'Grid layout for team members'
    displayName: 'Team Section'
    icon: 'shirt'
  }
  attributes: {
    header: Schema.Attribute.Component<'elements.header', false> & Schema.Attribute.Required
  }
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'call-to-actions.category-cta': CallToActionsCategoryCta
      'call-to-actions.newsletter-signup-cta': CallToActionsNewsletterSignupCta
      'call-to-actions.pagination-cta': CallToActionsPaginationCta
      'elements.button': ElementsButton
      'elements.header': ElementsHeader
      'elements.label': ElementsLabel
      'elements.seo-metadata': ElementsSeoMetadata
      'elements.text-block': ElementsTextBlock
      'markers.end-horizontal-layout-marker': MarkersEndHorizontalLayoutMarker
      'markers.start-horizontal-layout-marker': MarkersStartHorizontalLayoutMarker
      'menus.language-selector': MenusLanguageSelector
      'menus.mobile-menu': MenusMobileMenu
      'menus.product-categories-selector': MenusProductCategoriesSelector
      'menus.search-menu': MenusSearchMenu
      'menus.theme-selector': MenusThemeSelector
      'sections.blog-teaser': SectionsBlogTeaser
      'sections.brand-features-section': SectionsBrandFeaturesSection
      'sections.category-grid': SectionsCategoryGrid
      'sections.featured-products': SectionsFeaturedProducts
      'sections.hero': SectionsHero
      'sections.team-grid': SectionsTeamGrid
    }
  }
}
