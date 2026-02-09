import type { Schema, Struct } from '@strapi/strapi'

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens'
  info: {
    description: ''
    displayName: 'Api Token'
    name: 'Api Token'
    pluralName: 'api-tokens'
    singularName: 'api-token'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }> &
      Schema.Attribute.DefaultTo<''>
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    expiresAt: Schema.Attribute.DateTime
    lastUsedAt: Schema.Attribute.DateTime
    lifespan: Schema.Attribute.BigInteger
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> & Schema.Attribute.Private
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::api-token-permission'>
    publishedAt: Schema.Attribute.DateTime
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions'
  info: {
    description: ''
    displayName: 'API Token Permission'
    name: 'API Token Permission'
    pluralName: 'api-token-permissions'
    singularName: 'api-token-permission'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token-permission'> & Schema.Attribute.Private
    publishedAt: Schema.Attribute.DateTime
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions'
  info: {
    description: ''
    displayName: 'Permission'
    name: 'Permission'
    pluralName: 'permissions'
    singularName: 'permission'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> & Schema.Attribute.Private
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>
    publishedAt: Schema.Attribute.DateTime
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles'
  info: {
    description: ''
    displayName: 'Role'
    name: 'Role'
    pluralName: 'roles'
    singularName: 'role'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    description: Schema.Attribute.String
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> & Schema.Attribute.Private
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>
    publishedAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>
  }
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions'
  info: {
    description: 'Session Manager storage'
    displayName: 'Session'
    name: 'Session'
    pluralName: 'sessions'
    singularName: 'session'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
    i18n: {
      localized: false
    }
  }
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private
    childId: Schema.Attribute.String & Schema.Attribute.Private
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    deviceId: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Private
    expiresAt: Schema.Attribute.DateTime & Schema.Attribute.Required & Schema.Attribute.Private
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> & Schema.Attribute.Private
    origin: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Private
    publishedAt: Schema.Attribute.DateTime
    sessionId: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Private & Schema.Attribute.Unique
    status: Schema.Attribute.String & Schema.Attribute.Private
    type: Schema.Attribute.String & Schema.Attribute.Private
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    userId: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Private
  }
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens'
  info: {
    description: ''
    displayName: 'Transfer Token'
    name: 'Transfer Token'
    pluralName: 'transfer-tokens'
    singularName: 'transfer-token'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }> &
      Schema.Attribute.DefaultTo<''>
    expiresAt: Schema.Attribute.DateTime
    lastUsedAt: Schema.Attribute.DateTime
    lifespan: Schema.Attribute.BigInteger
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::transfer-token'> & Schema.Attribute.Private
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::transfer-token-permission'>
    publishedAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface AdminTransferTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions'
  info: {
    description: ''
    displayName: 'Transfer Token Permission'
    name: 'Transfer Token Permission'
    pluralName: 'transfer-token-permissions'
    singularName: 'transfer-token-permission'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::transfer-token-permission'> & Schema.Attribute.Private
    publishedAt: Schema.Attribute.DateTime
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users'
  info: {
    description: ''
    displayName: 'User'
    name: 'User'
    pluralName: 'users'
    singularName: 'user'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.Private & Schema.Attribute.DefaultTo<false>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    isActive: Schema.Attribute.Boolean & Schema.Attribute.Private & Schema.Attribute.DefaultTo<false>
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> & Schema.Attribute.Private
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6
      }>
    preferedLanguage: Schema.Attribute.String
    publishedAt: Schema.Attribute.DateTime
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> & Schema.Attribute.Private
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    username: Schema.Attribute.String
  }
}

export interface ApiAboutAbout extends Struct.SingleTypeSchema {
  collectionName: 'abouts'
  info: {
    description: 'Composable about page with dynamic sections: hero, story, values, team grid'
    displayName: 'About Us Page'
    pluralName: 'abouts'
    singularName: 'about'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'About Us Page'>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::about.about'>
    publishedAt: Schema.Attribute.DateTime
    sections: Schema.Attribute.DynamicZone<
      [
        'sections.hero',
        'sections.team-grid',
        'markers.start-horizontal-layout-marker',
        'markers.end-horizontal-layout-marker',
        'elements.text-block',
        'sections.brand-features-section',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiApiConfigApiConfig extends Struct.CollectionTypeSchema {
  collectionName: 'api_config'
  info: {
    description: 'Shared configuration values accessible by multiple services'
    displayName: 'API Configuration'
    pluralName: 'api-configs'
    singularName: 'api-config'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    description: Schema.Attribute.Text
    key: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255
      }>
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::api-config.api-config'> & Schema.Attribute.Private
    publishedAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    value: Schema.Attribute.Text & Schema.Attribute.Required
  }
}

export interface ApiAuthPageAuthPage extends Struct.SingleTypeSchema {
  collectionName: 'auth_pages'
  info: {
    description: 'UI labels for login and signup pages including form fields, buttons, and social auth options'
    displayName: 'Auth Page'
    pluralName: 'auth-pages'
    singularName: 'auth-page'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    appleButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    emailLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    emailPlaceholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Auth Page'>
    forgotPasswordLink: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    googleButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    haveAccountText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::auth-page.auth-page'>
    loginButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    loginLinkText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    loginSubtitle: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    loginTitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    nameLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    namePlaceholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    noAccountText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    orDividerText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    passwordLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    passwordPlaceholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    privacyLinkText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    signupButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    signupLinkText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    signupSubtitle: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    signupTitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    termsCheckboxText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    termsLinkText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiBlogPostTagBlogPostTag extends Struct.CollectionTypeSchema {
  collectionName: 'blog_post_tags'
  info: {
    displayName: 'Blog Post Tag'
    pluralName: 'blog-post-tags'
    singularName: 'blog-post-tag'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::blog-post-tag.blog-post-tag'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    tag: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    tagId: Schema.Attribute.UID &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiBlogPostBlogPost extends Struct.CollectionTypeSchema {
  collectionName: 'blog_posts'
  info: {
    description: 'Blog posts with title, content, featured image, author, tags, and SEO metadata'
    displayName: 'Blog Post'
    pluralName: 'blog-posts'
    singularName: 'blog-post'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    author: Schema.Attribute.Relation<'oneToOne', 'api::contributor.contributor'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'strapi-plugin-relation-filter': {
          filters: {
            roles: {
              roleId: {
                $eq: 'author'
              }
            }
          }
        }
      }>
    content: Schema.Attribute.Component<'elements.text-block', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    featuredImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::blog-post.blog-post'>
    publishedAt: Schema.Attribute.DateTime
    publishedDate: Schema.Attribute.DateTime & Schema.Attribute.Required
    readTimeInMinutes: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }> &
      Schema.Attribute.DefaultTo<5>
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    slug: Schema.Attribute.UID &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    tags: Schema.Attribute.Relation<'oneToMany', 'api::blog-post-tag.blog-post-tag'> & Schema.Attribute.Required
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiBlogBlog extends Struct.SingleTypeSchema {
  collectionName: 'blogs'
  info: {
    description: 'Blog listing page with title, description, category filters, and UI labels'
    displayName: 'Blog Page'
    pluralName: 'blogs'
    singularName: 'blog'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    aboutAuthorHeader: Schema.Attribute.Component<'elements.header', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Blog Page'>
    featuredBlogPosts: Schema.Attribute.Relation<'oneToMany', 'api::blog-post.blog-post'>
    header: Schema.Attribute.Component<'elements.header', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::blog.blog'>
    pagination: Schema.Attribute.Component<'call-to-actions.pagination-cta', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    publishedAt: Schema.Attribute.DateTime
    readArticleLabel: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    readTimeMinutesLabel: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    tagFilters: Schema.Attribute.Relation<'oneToMany', 'api::blog-post-tag.blog-post-tag'>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiContactUsContactUs extends Struct.SingleTypeSchema {
  collectionName: 'contact_us'
  info: {
    description: 'Contact us page with title, tabs, form labels, and contact information cards'
    displayName: 'Contact Us Page'
    pluralName: 'contacts-us'
    singularName: 'contact-us'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    contactTabLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    emailLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    emailPlaceholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Contact Us Page'>
    faqTabLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::contact-us.contact-us'>
    messageLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    messagePlaceholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    nameLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    namePlaceholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    submitButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    subtitle: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    title: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiContributorRoleContributorRole extends Struct.CollectionTypeSchema {
  collectionName: 'contributor_roles'
  info: {
    displayName: 'Role'
    pluralName: 'contributor-roles'
    singularName: 'contributor-role'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::contributor-role.contributor-role'>
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    publishedAt: Schema.Attribute.DateTime
    roleId: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiContributorContributor extends Struct.CollectionTypeSchema {
  collectionName: 'contributors'
  info: {
    description: 'Contributors with profile information, bio, social links, and their published articles'
    displayName: 'Contributor'
    pluralName: 'contributors'
    singularName: 'contributor'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    bio: Schema.Attribute.RichText &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    email: Schema.Attribute.Email &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    firstName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    github: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    instagram: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    lastName: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    linkedin: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::contributor.contributor'>
    profilePicture: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    publishedAt: Schema.Attribute.DateTime
    roles: Schema.Attribute.Relation<'oneToMany', 'api::contributor-role.contributor-role'> & Schema.Attribute.Required
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    slug: Schema.Attribute.UID<'firstName'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    twitter: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    website: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
  }
}

export interface ApiCurrencyCurrency extends Struct.CollectionTypeSchema {
  collectionName: 'currencies'
  info: {
    description: 'Supported currencies in the system with formatting rules'
    displayName: 'Currency'
    pluralName: 'currencies'
    singularName: 'currency'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 3
        minLength: 3
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    decimalPlaces: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.SetMinMax<
        {
          max: 8
          min: 0
        },
        number
      > &
      Schema.Attribute.DefaultTo<2>
    decimalSeparator: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1
      }> &
      Schema.Attribute.DefaultTo<'.'>
    exchangeRate: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }> &
      Schema.Attribute.DefaultTo<1>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::currency.currency'>
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    symbol: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 5
      }>
    symbolPosition: Schema.Attribute.Enumeration<['before', 'after']> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.DefaultTo<'before'>
    thousandsSeparator: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1
      }> &
      Schema.Attribute.DefaultTo<','>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiError404Error404 extends Struct.SingleTypeSchema {
  collectionName: 'error_404s'
  info: {
    description: '404 Not Found error page with localized title, subtitle, message, primary and secondary CTAs, and SEO metadata'
    displayName: 'Error 404'
    pluralName: 'error-404s'
    singularName: 'error-404'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    content: Schema.Attribute.Component<'elements.text-block', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Error 404: Page Not Found'>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::error-404.error-404'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiError410Error410 extends Struct.SingleTypeSchema {
  collectionName: 'error_410s'
  info: {
    description: '410 Gone (permanently removed) error page with localized title, subtitle, message, primary CTA, support contact message, and SEO metadata'
    displayName: 'Error 410'
    pluralName: 'error-410s'
    singularName: 'error-410'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    content: Schema.Attribute.Component<'elements.text-block', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Error 410: Page Gone'>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::error-410.error-410'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiFaqFaq extends Struct.SingleTypeSchema {
  collectionName: 'faqs'
  info: {
    description: 'Frequently Asked Questions page with title, description, and FAQ items organized by categories'
    displayName: 'FAQ Page'
    pluralName: 'faqs'
    singularName: 'faq'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    contactButtonText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.DefaultTo<'Contact Us'>
    contactPrompt: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.DefaultTo<"Didn't find what you're looking for?">
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    description: Schema.Attribute.RichText &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'FAQ Page'>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::faq.faq'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    subtitle: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiFeatureFlagFeatureFlag extends Struct.CollectionTypeSchema {
  collectionName: 'feature_flags'
  info: {
    description: 'Feature flags for controlling feature availability across the application'
    displayName: 'Feature Flag'
    pluralName: 'feature-flags'
    singularName: 'feature-flag'
  }
  options: {
    draftAndPublish: true
  }
  attributes: {
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    description: Schema.Attribute.String
    developmentEnabled: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<true>
    key: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Unique
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::feature-flag.feature-flag'> & Schema.Attribute.Private
    name: Schema.Attribute.String & Schema.Attribute.Required
    productionEnabled: Schema.Attribute.Boolean & Schema.Attribute.Required & Schema.Attribute.DefaultTo<false>
    publishedAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiFooterFooter extends Struct.SingleTypeSchema {
  collectionName: 'footer'
  info: {
    description: 'Global footer with brand description, section headers (Shop, About, Support), all navigation links, newsletter signup, copyright text, tagline, and bottom bar links'
    displayName: 'Footer'
    pluralName: 'footers'
    singularName: 'footer'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    columns: Schema.Attribute.DynamicZone<
      [
        'elements.text-block',
        'call-to-actions.newsletter-signup-cta',
        'markers.start-horizontal-layout-marker',
        'markers.end-horizontal-layout-marker',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    copyrightsLabel: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Footer'>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::footer.footer'>
    publishedAt: Schema.Attribute.DateTime
    quickLinks: Schema.Attribute.Component<'elements.button', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiHomepageHomepage extends Struct.SingleTypeSchema {
  collectionName: 'homepages'
  info: {
    description: 'Composable homepage with dynamic sections: hero, featured products, category grid, feature grid, blog teaser, two-column content, and newsletter signup'
    displayName: 'Homepage'
    pluralName: 'homepages'
    singularName: 'homepage'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Homepage'>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::homepage.homepage'>
    publishedAt: Schema.Attribute.DateTime
    sections: Schema.Attribute.DynamicZone<
      [
        'sections.hero',
        'sections.featured-products',
        'sections.category-grid',
        'sections.blog-teaser',
        'markers.start-horizontal-layout-marker',
        'markers.end-horizontal-layout-marker',
        'elements.text-block',
        'call-to-actions.newsletter-signup-cta',
        'sections.brand-features-section',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiNavigationNavigation extends Struct.SingleTypeSchema {
  collectionName: 'navigation'
  info: {
    description: 'Top menu bar navigation: main menu links, search functionality, theme selector, language selector, and UI labels for the navbar'
    displayName: 'Navigation'
    pluralName: 'navigations'
    singularName: 'navigation'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    aboutButton: Schema.Attribute.Component<'elements.button', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    blogButton: Schema.Attribute.Component<'elements.button', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    brandButton: Schema.Attribute.Component<'elements.button', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Navigation'>
    homeButton: Schema.Attribute.Component<'elements.button', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    languageMenu: Schema.Attribute.Component<'menus.language-selector', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::navigation.navigation'>
    loginButton: Schema.Attribute.Component<'elements.button', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    mobileMenuButton: Schema.Attribute.Component<'menus.mobile-menu', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    productsMenu: Schema.Attribute.Component<'menus.product-categories-selector', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    publishedAt: Schema.Attribute.DateTime
    searchMenu: Schema.Attribute.Component<'menus.search-menu', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    siteDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    siteTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60
      }> &
      Schema.Attribute.DefaultTo<'TheGreenBrother'>
    themeMenu: Schema.Attribute.Component<'menus.theme-selector', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiPrivacyPrivacy extends Struct.SingleTypeSchema {
  collectionName: 'privacies'
  info: {
    description: 'Privacy policy page with rich text content, last updated timestamp, custom update label, and SEO metadata (title, description, keywords)'
    displayName: 'Privacy Policy Page'
    pluralName: 'privacies'
    singularName: 'privacy'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    content: Schema.Attribute.Component<'elements.text-block', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Privacy Policy Page'>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::privacy.privacy'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiProductCategoriesPageProductCategoriesPage extends Struct.SingleTypeSchema {
  collectionName: 'product_categories_pages'
  info: {
    description: 'Product categories listing page with pagination configuration, empty state messaging, item count settings, navigation labels, count templates, and SEO metadata'
    displayName: 'Product Categories Page'
    pluralName: 'product-categories-pages'
    singularName: 'product-categories-page'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    bySellerText: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    certificatesSectionHeader: Schema.Attribute.Component<'elements.header', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Product Categories Page'>
    header: Schema.Attribute.Component<'elements.header', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::product-categories-page.product-categories-page'>
    pagination: Schema.Attribute.Component<'call-to-actions.pagination-cta', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    productsFilter: Schema.Attribute.Component<'filters.products-filter', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    productsSorter: Schema.Attribute.Component<'sorters.products-sorter', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    publishedAt: Schema.Attribute.DateTime
    relatedProductsSectionHeader: Schema.Attribute.Component<'elements.header', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiProductCategoryProductCategory extends Struct.CollectionTypeSchema {
  collectionName: 'product_categories'
  info: {
    description: 'Product category with name, description, image, and relation to products. Used for navigation dropdown and product organization.'
    displayName: 'Product Category'
    pluralName: 'product-categories'
    singularName: 'product-category'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    content: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    image: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::product-category.product-category'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    slug: Schema.Attribute.UID &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiProductCertificateProductCertificate extends Struct.CollectionTypeSchema {
  collectionName: 'product_certificates'
  info: {
    displayName: 'Product Certificate'
    pluralName: 'product-certificates'
    singularName: 'product-certificate'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    certificate: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    certificateId: Schema.Attribute.UID &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::product-certificate.product-certificate'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiProductTagProductTag extends Struct.CollectionTypeSchema {
  collectionName: 'product_tags'
  info: {
    displayName: 'Product Tag'
    pluralName: 'product-tags'
    singularName: 'product-tag'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::product-tag.product-tag'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    tag: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    tagId: Schema.Attribute.UID &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiProductProduct extends Struct.CollectionTypeSchema {
  collectionName: 'products'
  info: {
    description: 'Affiliate product with multi-language support, pricing in multiple currencies, rich content, featured flag, category tags, translation status, and affiliate tracking URL'
    displayName: 'Product'
    pluralName: 'products'
    singularName: 'product'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    affiliateButton: Schema.Attribute.Component<'elements.button', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    category: Schema.Attribute.Relation<'oneToOne', 'api::product-category.product-category'> &
      Schema.Attribute.Required
    certificates: Schema.Attribute.Relation<'oneToMany', 'api::product-certificate.product-certificate'>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    description: Schema.Attribute.DynamicZone<
      ['elements.text-block', 'markers.start-horizontal-layout-marker', 'markers.end-horizontal-layout-marker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    disclaimerLabel: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    header: Schema.Attribute.Component<'elements.header', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    images: Schema.Attribute.Media<'images', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>
    prices: Schema.Attribute.Component<'elements.price', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: false
        }
      }> &
      Schema.Attribute.SetMinMax<
        {
          min: 1
        },
        number
      >
    publishedAt: Schema.Attribute.DateTime
    seller: Schema.Attribute.Relation<'oneToOne', 'api::contributor.contributor'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'strapi-plugin-relation-filter': {
          filters: {
            roles: {
              roleId: {
                $eq: 'seller'
              }
            }
          }
        }
      }>
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    slug: Schema.Attribute.UID &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    tags: Schema.Attribute.Relation<'oneToMany', 'api::product-tag.product-tag'>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    viewDetailsLabel: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
  }
}

export interface ApiProfileProfile extends Struct.SingleTypeSchema {
  collectionName: 'profiles'
  info: {
    description: 'UI labels for profile, edit profile, wishlist, currency, and account deletion pages'
    displayName: 'Profile Page'
    pluralName: 'profiles'
    singularName: 'profile'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    cancelButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    confirmButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    currencyDescription: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    currencyTitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    deleteAccountTitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    deleteAccountWarning: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    deleteButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    editProfileTitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    emailLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Profile Page'>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::profile.profile'>
    logoutButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    nameLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    passwordLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    profileTitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    publishedAt: Schema.Attribute.DateTime
    saveButton: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    wishlistEmptyMessage: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    wishlistTitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
  }
}

export interface ApiTermTerm extends Struct.SingleTypeSchema {
  collectionName: 'terms'
  info: {
    description: 'Terms of service page with rich text content, last updated timestamp, custom update label, and SEO metadata (title, description, keywords)'
    displayName: 'Terms of Service Page'
    pluralName: 'terms'
    singularName: 'term'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    content: Schema.Attribute.Component<'elements.text-block', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<'Terms and Conditions Page'>
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::term.term'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface ApiThemeTheme extends Struct.CollectionTypeSchema {
  collectionName: 'themes'
  info: {
    displayName: 'Theme'
    pluralName: 'themes'
    singularName: 'theme'
  }
  options: {
    draftAndPublish: true
  }
  pluginOptions: {
    i18n: {
      localized: true
    }
  }
  attributes: {
    content: Schema.Attribute.Component<'elements.label', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::theme.theme'>
    publishedAt: Schema.Attribute.DateTime
    seoMetadata: Schema.Attribute.Component<'elements.seo-metadata', false> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    themeId: Schema.Attribute.UID &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true
        }
      }>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface PluginContentReleasesRelease extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases'
  info: {
    displayName: 'Release'
    pluralName: 'releases'
    singularName: 'release'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    actions: Schema.Attribute.Relation<'oneToMany', 'plugin::content-releases.release-action'>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::content-releases.release'> & Schema.Attribute.Private
    name: Schema.Attribute.String & Schema.Attribute.Required
    publishedAt: Schema.Attribute.DateTime
    releasedAt: Schema.Attribute.DateTime
    scheduledAt: Schema.Attribute.DateTime
    status: Schema.Attribute.Enumeration<['ready', 'blocked', 'failed', 'done', 'empty']> & Schema.Attribute.Required
    timezone: Schema.Attribute.String
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface PluginContentReleasesReleaseAction extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions'
  info: {
    displayName: 'Release Action'
    pluralName: 'release-actions'
    singularName: 'release-action'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    entryDocumentId: Schema.Attribute.String
    isEntryValid: Schema.Attribute.Boolean
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::content-releases.release-action'> &
      Schema.Attribute.Private
    publishedAt: Schema.Attribute.DateTime
    release: Schema.Attribute.Relation<'manyToOne', 'plugin::content-releases.release'>
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> & Schema.Attribute.Required
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale'
  info: {
    collectionName: 'locales'
    description: ''
    displayName: 'Locale'
    pluralName: 'locales'
    singularName: 'locale'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::i18n.locale'> & Schema.Attribute.Private
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50
          min: 1
        },
        number
      >
    publishedAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface PluginReviewWorkflowsWorkflow extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows'
  info: {
    description: ''
    displayName: 'Workflow'
    name: 'Workflow'
    pluralName: 'workflows'
    singularName: 'workflow'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    contentTypes: Schema.Attribute.JSON & Schema.Attribute.Required & Schema.Attribute.DefaultTo<'[]'>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::review-workflows.workflow'> &
      Schema.Attribute.Private
    name: Schema.Attribute.String & Schema.Attribute.Required & Schema.Attribute.Unique
    publishedAt: Schema.Attribute.DateTime
    stageRequiredToPublish: Schema.Attribute.Relation<'oneToOne', 'plugin::review-workflows.workflow-stage'>
    stages: Schema.Attribute.Relation<'oneToMany', 'plugin::review-workflows.workflow-stage'>
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

export interface PluginReviewWorkflowsWorkflowStage extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages'
  info: {
    description: ''
    displayName: 'Stages'
    name: 'Workflow Stage'
    pluralName: 'workflow-stages'
    singularName: 'workflow-stage'
  }
  options: {
    draftAndPublish: false
    version: '1.1.0'
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::review-workflows.workflow-stage'> &
      Schema.Attribute.Private
    name: Schema.Attribute.String
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>
    publishedAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    workflow: Schema.Attribute.Relation<'manyToOne', 'plugin::review-workflows.workflow'>
  }
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files'
  info: {
    description: ''
    displayName: 'File'
    pluralName: 'files'
    singularName: 'file'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    alternativeText: Schema.Attribute.Text
    caption: Schema.Attribute.Text
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    ext: Schema.Attribute.String
    focalPoint: Schema.Attribute.JSON
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> & Schema.Attribute.Private
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    formats: Schema.Attribute.JSON
    hash: Schema.Attribute.String & Schema.Attribute.Required
    height: Schema.Attribute.Integer
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'> & Schema.Attribute.Private
    mime: Schema.Attribute.String & Schema.Attribute.Required
    name: Schema.Attribute.String & Schema.Attribute.Required
    previewUrl: Schema.Attribute.Text
    provider: Schema.Attribute.String & Schema.Attribute.Required
    provider_metadata: Schema.Attribute.JSON
    publishedAt: Schema.Attribute.DateTime
    related: Schema.Attribute.Relation<'morphToMany'>
    size: Schema.Attribute.Decimal & Schema.Attribute.Required
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    url: Schema.Attribute.Text & Schema.Attribute.Required
    width: Schema.Attribute.Integer
  }
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders'
  info: {
    displayName: 'Folder'
    pluralName: 'folders'
    singularName: 'folder'
  }
  options: {
    draftAndPublish: false
  }
  pluginOptions: {
    'content-manager': {
      visible: false
    }
    'content-type-builder': {
      visible: false
    }
  }
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>
    createdAt: Schema.Attribute.DateTime
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>
    locale: Schema.Attribute.String & Schema.Attribute.Private
    localizations: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'> & Schema.Attribute.Private
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1
      }>
    pathId: Schema.Attribute.Integer & Schema.Attribute.Required & Schema.Attribute.Unique
    publishedAt: Schema.Attribute.DateTime
    updatedAt: Schema.Attribute.DateTime
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> & Schema.Attribute.Private
  }
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken
      'admin::api-token-permission': AdminApiTokenPermission
      'admin::permission': AdminPermission
      'admin::role': AdminRole
      'admin::session': AdminSession
      'admin::transfer-token': AdminTransferToken
      'admin::transfer-token-permission': AdminTransferTokenPermission
      'admin::user': AdminUser
      'api::about.about': ApiAboutAbout
      'api::api-config.api-config': ApiApiConfigApiConfig
      'api::auth-page.auth-page': ApiAuthPageAuthPage
      'api::blog-post-tag.blog-post-tag': ApiBlogPostTagBlogPostTag
      'api::blog-post.blog-post': ApiBlogPostBlogPost
      'api::blog.blog': ApiBlogBlog
      'api::contact-us.contact-us': ApiContactUsContactUs
      'api::contributor-role.contributor-role': ApiContributorRoleContributorRole
      'api::contributor.contributor': ApiContributorContributor
      'api::currency.currency': ApiCurrencyCurrency
      'api::error-404.error-404': ApiError404Error404
      'api::error-410.error-410': ApiError410Error410
      'api::faq.faq': ApiFaqFaq
      'api::feature-flag.feature-flag': ApiFeatureFlagFeatureFlag
      'api::footer.footer': ApiFooterFooter
      'api::homepage.homepage': ApiHomepageHomepage
      'api::navigation.navigation': ApiNavigationNavigation
      'api::privacy.privacy': ApiPrivacyPrivacy
      'api::product-categories-page.product-categories-page': ApiProductCategoriesPageProductCategoriesPage
      'api::product-category.product-category': ApiProductCategoryProductCategory
      'api::product-certificate.product-certificate': ApiProductCertificateProductCertificate
      'api::product-tag.product-tag': ApiProductTagProductTag
      'api::product.product': ApiProductProduct
      'api::profile.profile': ApiProfileProfile
      'api::term.term': ApiTermTerm
      'api::theme.theme': ApiThemeTheme
      'plugin::content-releases.release': PluginContentReleasesRelease
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction
      'plugin::i18n.locale': PluginI18NLocale
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage
      'plugin::upload.file': PluginUploadFile
      'plugin::upload.folder': PluginUploadFolder
    }
  }
}
