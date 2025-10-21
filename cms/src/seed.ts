// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * CMS Database Seeding (Internal API Version)
 * Populates Strapi single types and collections with content in 3 languages (en, it, he)
 * Uses Strapi's internal APIs for direct database access during bootstrap
 */

import type { Core } from '@strapi/types'

/**
 * Seed script state tracking
 */
interface SeedState {
  successCount: number
  failureCount: number
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Create or update a product (collection type) - idempotent
 */
async function updateProduct(
  strapi: Core.Strapi,
  title: string,
  locale: string,
  description: string,
  content: string,
  excerpt: string,
  affiliateUrl: string,
  price: number,
  currency: 'USD' | 'EUR' | 'GBP' | 'ILS' | 'CAD' | 'AUD' | 'JPY' | 'CNY',
  category: string,
  featured: boolean,
  state: SeedState
): Promise<void> {
  try {
    const slug = generateSlug(title)

    const data = {
      title,
      slug,
      description,
      content,
      excerpt,
      affiliateUrl,
      price,
      currency,
      category,
      featured,
      translationStatus: 'complete' as const,
    }

    // Check if product already exists with this slug and locale
    const existing = await strapi.db.query('api::product.product').findOne({
      where: { locale, slug, title },
    })

    if (existing) {
      // Update existing product and publish
      await strapi.documents('api::product.product').update({
        documentId: existing.documentId,
        locale,
        title,
        slug,
        description,
        content,
        excerpt,
        affiliateUrl,
        price,
        currency,
        category,
        featured,
        translationStatus: 'complete' as const,
        status: 'published',
      })
    } else {
      // Create new product and publish
      await strapi.documents('api::product.product').create({
        locale,
        data,
        status: 'published',
      })
    }

    console.log(`✅ Created/updated product '${title}' for locale: ${locale}`)
    state.successCount++
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`❌ Failed to create/update product '${title}' for locale ${locale}: ${message}`)
    state.failureCount++
    throw error
  }
}

/**
 * Create or update a currency (collection type) - idempotent
 */
async function updateCurrency(
  strapi: Core.Strapi,
  code: string,
  name: string,
  symbol: string,
  decimalPlaces: number,
  symbolPosition: 'before' | 'after',
  thousandsSep: string,
  decimalSep: string,
  exchangeRate: number,
  sortOrder: number,
  state: SeedState
): Promise<void> {
  try {
    const data = {
      code,
      name,
      displayName: name,
      symbol,
      decimalPlaces,
      symbolPosition,
      thousandsSeparator: thousandsSep,
      decimalSeparator: decimalSep,
      exchangeRate,
      sortOrder,
      isActive: true,
    }

    // Check if currency already exists with this code
    const existing = await strapi.db.query('api::currency.currency').findOne({
      where: { code },
    })

    if (existing) {
      // Update existing currency and publish
      await strapi.documents('api::currency.currency').update({
        documentId: existing.documentId,
        code,
        name,
        displayName: name,
        symbol,
        decimalPlaces,
        symbolPosition,
        thousandsSeparator: thousandsSep,
        decimalSeparator: decimalSep,
        exchangeRate,
        sortOrder,
        isActive: true,
        status: 'published',
      })
    } else {
      // Create new currency and publish
      await strapi.documents('api::currency.currency').create({
        data,
        status: 'published',
      })
    }

    console.log(`✅ Created/updated currency '${code}'`)
    state.successCount++
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`❌ Failed to create/update currency '${code}': ${message}`)
    state.failureCount++
    throw error
  }
}

/**
 * Single type UID union - all valid single type identifiers
 */
type SingleTypeUID =
  | 'api::navigation.navigation'
  | 'api::footer.footer'
  | 'api::homepage.homepage'
  | 'api::about.about'
  | 'api::contact.contact'
  | 'api::privacy.privacy'
  | 'api::term.term'
  | 'api::product-page.product-page'
  | 'api::error-404.error-404'
  | 'api::error-410.error-410'
  | 'api::system-message.system-message'

/**
 * Update single type with locale data - type-safe version
 * For single types, we check if document exists and create/update accordingly
 */
async function updateSingleType(
  strapi: Core.Strapi,
  uid: SingleTypeUID,
  locale: string,
  data: Record<string, unknown> & { entryTitle: string },
  state: SeedState
): Promise<void> {
  try {
    // Check if single type document exists for this locale
    const existing = await strapi.db.query(uid).findOne({
      where: { locale },
    })

    if (!existing) {
      // Create new document for this locale and publish
      await strapi.documents(uid).create({
        locale,
        data,
        status: 'published',
      })
    }

    console.log(`✅ Updated ${uid} for locale: ${locale}`)
    state.successCount++
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`❌ Failed to update ${uid} for locale ${locale}: ${message}`)
    state.failureCount++
    throw error
  }
}

/**
 * Main seed function - populates database with initial content
 */
export async function seedDatabase(strapi: Core.Strapi): Promise<void> {
  const state: SeedState = {
    successCount: 0,
    failureCount: 0,
  }

  console.log('🚀 Starting CMS population...\n')

  // Navigation single type
  console.log('📝 Populating navigation...')
  await updateSingleType(
    strapi,
    'api::navigation.navigation',
    'en',
    {
      entryTitle: 'Navigation',
      brandName: 'Affilibuster',
      siteTitle: 'Affilibuster - Multi-Language Affiliate Platform',
      siteDescription:
        'Find the best products in English, Italian, and Hebrew with our multi-language affiliate platform.',
      siteKeywords: ['affiliate', 'products', 'shopping', 'multilingual', 'English', 'Italian', 'Hebrew'],
      homeLabel: 'Home',
      productsLabel: 'Products',
      aboutLabel: 'About',
      contactLabel: 'Contact',
      languageSelectorLabel: 'Select language',
      currencySelectorLabel: 'Select currency',
      themeSelectorLabel: 'Select theme',
      themeLightLabel: 'Light',
      themeDarkLabel: 'Dark',
      themeSystemLabel: 'System',
      mobileMenuLabel: 'Open menu',
      mobileMenuCloseLabel: 'Close menu',
      twitterLabel: 'Twitter',
      facebookLabel: 'Facebook',
      currencySelectorAriaLabel: 'Select currency',
      languageSelectorAriaLabel: 'Select language',
      themeSelectorAriaLabel: 'Select theme',
      browseProductsButton: 'Browse Products',
      promptTitleTemplate: 'Switch to {language}?',
      promptMessageTemplate: 'We detected you might prefer viewing this site in {language}. Would you like to switch?',
      yesButtonTemplate: 'Yes, switch to {language}',
      noButtonText: 'No thanks',
      availableInOtherLanguagesLabel: 'Available in other languages:',
      mobileMenuCloseAriaLabel: 'Close menu',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::navigation.navigation',
    'it',
    {
      entryTitle: 'Navigation',
      brandName: 'Affilibuster',
      siteTitle: 'Affilibuster - Piattaforma di Shopping Multi-Lingua',
      siteDescription:
        'Trova i migliori prodotti in inglese, italiano ed ebraico con la nostra piattaforma di affiliazione multilingue.',
      siteKeywords: ['affiliazione', 'prodotti', 'shopping', 'multilingue', 'inglese', 'italiano', 'ebraico'],
      homeLabel: 'Home',
      productsLabel: 'Prodotti',
      aboutLabel: 'Chi Siamo',
      contactLabel: 'Contatti',
      languageSelectorLabel: 'Seleziona lingua',
      currencySelectorLabel: 'Seleziona valuta',
      themeSelectorLabel: 'Seleziona tema',
      themeLightLabel: 'Chiaro',
      themeDarkLabel: 'Scuro',
      themeSystemLabel: 'Sistema',
      mobileMenuLabel: 'Apri menu',
      mobileMenuCloseLabel: 'Chiudi menu',
      twitterLabel: 'Twitter',
      facebookLabel: 'Facebook',
      currencySelectorAriaLabel: 'Seleziona valuta',
      languageSelectorAriaLabel: 'Seleziona lingua',
      themeSelectorAriaLabel: 'Seleziona tema',
      browseProductsButton: 'Sfoglia Prodotti',
      promptTitleTemplate: 'Passare a {language}?',
      promptMessageTemplate:
        'Abbiamo rilevato che potresti preferire visualizzare questo sito in {language}. Vorresti passare?',
      yesButtonTemplate: 'Sì, passa a {language}',
      noButtonText: 'No grazie',
      availableInOtherLanguagesLabel: 'Disponibile in altre lingue:',
      mobileMenuCloseAriaLabel: 'Chiudi menu',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::navigation.navigation',
    'he',
    {
      entryTitle: 'Navigation',
      brandName: 'Affilibuster',
      siteTitle: 'Affilibuster - פלטפורמת קניות רב-לשונית',
      siteDescription: 'מצא את המוצרים הטובים ביותר באנגלית, איטלקית ועברית עם הפלטפורמה הרב-לשונית שלנו.',
      siteKeywords: ['שיווק אחוז', 'מוצרים', 'קניות', 'רב-לשוני', 'אנגלית', 'איטלקית', 'עברית'],
      homeLabel: 'בית',
      productsLabel: 'מוצרים',
      aboutLabel: 'אודות',
      contactLabel: 'צור קשר',
      languageSelectorLabel: 'בחר שפה',
      currencySelectorLabel: 'בחר מטבע',
      themeSelectorLabel: 'בחר ערכת נושאים',
      themeLightLabel: 'בהיר',
      themeDarkLabel: 'אפל',
      themeSystemLabel: 'מערכת',
      mobileMenuLabel: 'פתח תפריט',
      mobileMenuCloseLabel: 'סגור תפריט',
      twitterLabel: 'טוויטר',
      facebookLabel: 'פייסבוק',
      currencySelectorAriaLabel: 'בחר מטבע',
      languageSelectorAriaLabel: 'בחר שפה',
      themeSelectorAriaLabel: 'בחר ערכת נושאים',
      browseProductsButton: 'עיין במוצרים',
      promptTitleTemplate: 'לעבור ל-{language}?',
      promptMessageTemplate: 'זיהינו שייתכן שתעדיף להציג את האתר הזה ב-{language}. האם תרצה להעביר?',
      yesButtonTemplate: 'כן, עבור ל-{language}',
      noButtonText: 'לא תודה',
      availableInOtherLanguagesLabel: 'זמין בשפות אחרות:',
      mobileMenuCloseAriaLabel: 'סגור תפריט',
    },
    state
  )

  console.log('')

  // Footer single type
  console.log('📝 Populating footer...')
  await updateSingleType(
    strapi,
    'api::footer.footer',
    'en',
    {
      entryTitle: 'Footer',
      brandDescription:
        'Multi-language affiliate platform helping you find the best products across languages and currencies. Shop with confidence in your preferred language.',
      quickLinksTitle: 'Quick Links',
      privacyPolicyLabel: 'Privacy Policy',
      termsOfServiceLabel: 'Terms of Service',
      contactLabel: 'Contact',
      aboutUsLabel: 'About Us',
      newsletterTitle: 'Stay Updated',
      newsletterDescription: 'Get the latest product recommendations and updates',
      subscribeButton: 'Subscribe',
      emailPlaceholder: 'Your email',
      copyrightText: 'All rights reserved.',
      footerTagline: 'Made with ❤️ for shoppers worldwide',
      twitterAriaLabel: 'Twitter',
      facebookAriaLabel: 'Facebook',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::footer.footer',
    'it',
    {
      entryTitle: 'Footer',
      brandDescription:
        'Piattaforma di affiliazione multilingue che ti aiuta a trovare i migliori prodotti in diverse lingue e valute. Acquista con fiducia nella tua lingua preferita.',
      quickLinksTitle: 'Link Rapidi',
      privacyPolicyLabel: 'Informativa sulla Privacy',
      termsOfServiceLabel: 'Termini di Servizio',
      contactLabel: 'Contatti',
      aboutUsLabel: 'Chi Siamo',
      newsletterTitle: 'Rimani Aggiornato',
      newsletterDescription: 'Ricevi le ultime raccomandazioni di prodotti e aggiornamenti',
      subscribeButton: 'Iscriviti',
      emailPlaceholder: 'Il tuo indirizzo email',
      copyrightText: 'Tutti i diritti riservati.',
      footerTagline: 'Realizzato con ❤️ per gli acquirenti di tutto il mondo',
      twitterAriaLabel: 'Twitter',
      facebookAriaLabel: 'Facebook',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::footer.footer',
    'he',
    {
      entryTitle: 'Footer',
      brandDescription:
        'פלטפורמת שיווק אחוז רב-לשונית המסייעת לך למצוא את המוצרים הטובים ביותר בשפות ומטבעות שונים. קנו בביטחון בשפה המועדפת עליכם.',
      quickLinksTitle: 'קישורים מהירים',
      privacyPolicyLabel: 'מדיניות פרטיות',
      termsOfServiceLabel: 'תנאי השירות',
      contactLabel: 'צור קשר',
      aboutUsLabel: 'אודות',
      newsletterTitle: 'הישאר מעודכן',
      newsletterDescription: 'קבל את ההמלצות וההעדכונים העדכניים ביותר למוצרים',
      subscribeButton: 'הירשם',
      emailPlaceholder: 'דוא"ל שלך',
      copyrightText: 'כל הזכויות שמורות.',
      footerTagline: 'עשוי עם ❤️ לקנייני ברחבי העולם',
      twitterAriaLabel: 'טוויטר',
      facebookAriaLabel: 'פייסבוק',
    },
    state
  )

  console.log('')

  // Homepage single type
  console.log('📝 Populating homepage...')
  await updateSingleType(
    strapi,
    'api::homepage.homepage',
    'en',
    {
      entryTitle: 'Homepage',
      heroTitle: 'Helping you find the **best products**',
      heroSubtitle:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      featuredProductsTitle: 'Featured Products',
      featuredProductsDescription: 'Handpicked products from top categories',
      featuredSectionTitle: 'Featured Products',
      featuredSectionSubtitle: 'Handpicked products from top categories',
      seeAllProductsText: 'See All Products',
      featuredBadgeText: 'Featured',
      viewDetailsButtonText: 'View Details',
      whyChooseUsTitle: 'Why Choose Affilibuster',
      testimonialsText:
        'We are on a mission to find the best products for smart shoppers like you. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      testimonialAuthor: 'Affilibuster',
      testimonialRole: 'Product Curator',
      showingProductsTemplate: 'Showing {count} of {total} products',
      allProductsLabel: 'All Products',
      metaTitle: 'Affilibuster - Multi-Language Shopping Platform',
      metaDescription:
        'Find the best products in English, Italian, and Hebrew with our multi-language affiliate platform.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::homepage.homepage',
    'it',
    {
      entryTitle: 'Homepage',
      heroTitle: 'Ti aiutiamo a trovare i **migliori prodotti**',
      heroSubtitle:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      featuredProductsTitle: 'Prodotti in Evidenza',
      featuredProductsDescription: 'Prodotti selezionati dalle migliori categorie',
      featuredSectionTitle: 'Prodotti in Evidenza',
      featuredSectionSubtitle: 'Prodotti selezionati dalle migliori categorie',
      seeAllProductsText: 'Visualizza Tutti i Prodotti',
      featuredBadgeText: 'In Evidenza',
      viewDetailsButtonText: 'Visualizza Dettagli',
      whyChooseUsTitle: 'Perché Scegliere Affilibuster',
      testimonialsText:
        'Siamo in missione per trovare i migliori prodotti per i nostri clienti intelligenti. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      testimonialAuthor: 'Affilibuster',
      testimonialRole: 'Curatore di Prodotti',
      showingProductsTemplate: 'Mostrando {count} di {total} prodotti',
      allProductsLabel: 'Tutti i Prodotti',
      metaTitle: 'Affilibuster - Piattaforma di Shopping Multi-Lingua',
      metaDescription:
        'Trova i migliori prodotti in inglese, italiano ed ebraico con la nostra piattaforma di affiliazione multilingue.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::homepage.homepage',
    'he',
    {
      entryTitle: 'Homepage',
      heroTitle: 'עוזרים לך למצוא את **המוצרים הטובים ביותר**',
      heroSubtitle:
        'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט, סד דו אימוד טמפורס אינקידידונט אוט לבורה את דולר מגנה אליקווה.',
      featuredProductsTitle: 'מוצרים מומלצים',
      featuredProductsDescription: 'מוצרים נבחרים מהקטגוריות המובילות',
      featuredSectionTitle: 'מוצרים מומלצים',
      featuredSectionSubtitle: 'מוצרים נבחרים מהקטגוריות המובילות',
      seeAllProductsText: 'צפה בכל המוצרים',
      featuredBadgeText: 'מומלץ',
      viewDetailsButtonText: 'צפה בפרטים',
      whyChooseUsTitle: 'למה לבחור ב-Affilibuster',
      testimonialsText:
        'אנחנו בעלי משימה למצוא את המוצרים הטובים ביותר עבור קניידי חכם כמוך. לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט.',
      testimonialAuthor: 'Affilibuster',
      testimonialRole: 'קיורטור מוצרים',
      showingProductsTemplate: 'מוצגים {count} מתוך {total} מוצרים',
      allProductsLabel: 'כל המוצרים',
      metaTitle: 'Affilibuster - פלטפורמת קניות רב-לשונית',
      metaDescription: 'מצא את המוצרים הטובים ביותר באנגלית, איטלקית ועברית עם הפלטפורמה הרב-לשונית שלנו.',
    },
    state
  )

  console.log('')

  // About single type
  console.log('📝 Populating about...')
  await updateSingleType(
    strapi,
    'api::about.about',
    'en',
    {
      entryTitle: 'About',
      heroTitle: 'About **Affilibuster**',
      heroSubtitle:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      missionTitle: 'Our Mission',
      missionContent:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      techStackTitle: 'Built with Modern Technology',
      techStackDescription:
        'Affilibuster leverages cutting-edge technologies to provide a seamless shopping experience across languages and borders.',
      ctaTitle: 'Ready to Find Your Perfect Products?',
      ctaText: 'Start browsing our curated collection today and discover amazing products in your preferred language.',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      metaTitle: 'About Affilibuster - Our Story',
      metaDescription:
        "Learn about Affilibuster's mission to connect shoppers globally across languages and currencies.",
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::about.about',
    'it',
    {
      entryTitle: 'About',
      heroTitle: 'Chi siamo **Affilibuster**',
      heroSubtitle:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      missionTitle: 'La Nostra Missione',
      missionContent:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      techStackTitle: 'Realizzato con Tecnologia Moderna',
      techStackDescription:
        "Affilibuster sfrutta le tecnologie più avanzate per fornire un'esperienza di acquisto senza soluzione di continuità in più lingue e confini.",
      ctaTitle: 'Pronto a Trovare i Tuoi Prodotti Perfetti?',
      ctaText:
        'Inizia a sfogliare la nostra collezione curata oggi e scopri prodotti straordinari nella tua lingua preferita.',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      metaTitle: 'Chi Siamo - La Nostra Storia',
      metaDescription:
        'Scopri la missione di Affilibuster di connettere gli acquirenti globalmente attraverso lingue e valute.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::about.about',
    'he',
    {
      entryTitle: 'About',
      heroTitle: 'אודות **Affilibuster**',
      heroSubtitle:
        'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט, סד דו אימוד טמפורס אינקידידונט אוט לבורה את דולר מגנה אליקווה.',
      missionTitle: 'משימתנו',
      missionContent:
        'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט, סד דו אימוד טמפורס אינקידידונט אוט לבורה את דולר מגנה אליקווה.',
      techStackTitle: 'בנוי עם טכנולוגיה מודרנית',
      techStackDescription:
        'Affilibuster משתמשת בטכנולוגיות חדשות ביותר כדי לספק חווית קנייה חלקה על פני שפות וגבולות.',
      ctaTitle: 'מוכן למצוא את המוצרים המושלמים שלך?',
      ctaText: 'התחל לעיין בקולקציה הקוראת שלנו היום וגלה מוצרים מדהימים בשפה המועדפת עליך.',
      content:
        'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט, סד דו אימוד טמפורס אינקידידונט אוט לבורה את דולר מגנה אליקווה.',
      metaTitle: 'אודות - הסיפור שלנו',
      metaDescription: 'גלה את המשימה של Affilibuster לחיבור קניינים גלובליים על פני שפות ומטבעות.',
    },
    state
  )

  console.log('')

  // Contact single type
  console.log('📝 Populating contact...')
  await updateSingleType(
    strapi,
    'api::contact.contact',
    'en',
    {
      entryTitle: 'Contact',
      heroTitle: 'Contact Us',
      heroSubtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      responseTimeTitle: 'Response Time',
      responseTimeText: 'We aim to respond to all inquiries within 24 business hours',
      responseTimeMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      officeHoursTitle: 'Office Hours',
      officeHoursText: 'Monday to Friday, 9:00 AM - 6:00 PM CET',
      officeHoursMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      generalInquiriesEmail: 'info@affilibuster.com',
      supportEmail: 'support@affilibuster.com',
      businessEmail: 'business@affilibuster.com',
      privacyEmail: 'privacy@affilibuster.com',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      metaTitle: 'Contact Affilibuster',
      metaDescription: 'Get in touch with our multilingual support team. We are here to help.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::contact.contact',
    'it',
    {
      entryTitle: 'Contact',
      heroTitle: 'Contattaci',
      heroSubtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      responseTimeTitle: 'Tempo di Risposta',
      responseTimeText: 'Miriamo a rispondere a tutte le richieste entro 24 ore lavorative',
      responseTimeMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      officeHoursTitle: 'Orari di Ufficio',
      officeHoursText: 'Da lunedì a venerdì, 9:00 AM - 6:00 PM CET',
      officeHoursMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      generalInquiriesEmail: 'info@affilibuster.com',
      supportEmail: 'support@affilibuster.com',
      businessEmail: 'business@affilibuster.com',
      privacyEmail: 'privacy@affilibuster.com',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      metaTitle: 'Contatta Affilibuster',
      metaDescription: 'Mettiti in contatto con il nostro team di supporto multilingue. Siamo qui per aiutarti.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::contact.contact',
    'he',
    {
      entryTitle: 'Contact',
      heroTitle: 'צור קשר',
      heroSubtitle: 'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט.',
      responseTimeTitle: 'זמן התגובה',
      responseTimeText: 'אנו שואפים להשיב לכל השאילתות תוך 24 שעות עסקיות',
      responseTimeMessage: 'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט.',
      officeHoursTitle: 'שעות הפעילות',
      officeHoursText: "יום ב' עד יום ו', 09:00 - 18:00 CET",
      officeHoursMessage: 'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט.',
      generalInquiriesEmail: 'info@affilibuster.com',
      supportEmail: 'support@affilibuster.com',
      businessEmail: 'business@affilibuster.com',
      privacyEmail: 'privacy@affilibuster.com',
      content: 'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט.',
      metaTitle: 'צור קשר עם Affilibuster',
      metaDescription: 'צור קשר עם צוות התמיכה הרב-לשוני שלנו. אנחנו כאן כדי לעזור.',
    },
    state
  )

  console.log('')

  // Privacy single type
  console.log('📝 Populating privacy...')
  await updateSingleType(
    strapi,
    'api::privacy.privacy',
    'en',
    {
      entryTitle: 'Privacy Policy',
      title: 'Privacy Policy',
      lastUpdated: '2025-10-22T14:00:00Z',
      lastUpdatedLabel: 'Last updated:',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
      metaTitle: 'Privacy Policy',
      metaDescription: 'Affilibuster Privacy Policy - How we protect your data.',
      metaKeywords: [],
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::privacy.privacy',
    'it',
    {
      entryTitle: 'Privacy Policy',
      title: 'Informativa sulla Privacy',
      lastUpdated: '2025-10-22T14:00:00Z',
      lastUpdatedLabel: 'Ultimo aggiornamento:',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
      metaTitle: 'Informativa sulla Privacy',
      metaDescription: 'Informativa sulla Privacy di Affilibuster - Come proteggiamo i tuoi dati.',
      metaKeywords: [],
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::privacy.privacy',
    'he',
    {
      entryTitle: 'Privacy Policy',
      title: 'מדיניות פרטיות',
      lastUpdated: '2025-10-22T14:00:00Z',
      lastUpdatedLabel: 'עדכון אחרון:',
      content:
        'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט, סד דו אימוד טמפורס אינקידידונט אוט לבורה את דולר מגנה אליקווה. יוטא אנים אד מינים ווניאם, קוויס נוסטרוד אקסרסיטציון וללמקו לאבוריס ניסי וט אליקוויפ אקס אא קוממודו קונסקוויאט. דויס אוטה אירורה דולר ין רפריהנדרית ין ווולופטאטה ווליט אסה קילום דולורה או פוגיאט נוללא פאריאטור. אקסקפטור סינט אוקקאקאט קופידאטאט נון פרואידנט, סונט ין קולפא קוי אופיציא דאסרונט מוללית אנים יד אסט לאבורום.',
      metaTitle: 'מדיניות פרטיות',
      metaDescription: 'מדיניות הפרטיות של Affilibuster - כיצד אנו מגנים על הנתונים שלך.',
      metaKeywords: [],
    },
    state
  )

  console.log('')

  // Term single type (terms of service)
  console.log('📝 Populating term...')
  await updateSingleType(
    strapi,
    'api::term.term',
    'en',
    {
      entryTitle: 'Terms of Service',
      title: 'Terms of Service',
      lastUpdated: '2025-10-22T14:00:00Z',
      lastUpdatedLabel: 'Last updated:',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
      metaTitle: 'Terms of Service',
      metaDescription: 'Affilibuster Terms of Service - Our terms and conditions.',
      metaKeywords: [],
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::term.term',
    'it',
    {
      entryTitle: 'Terms of Service',
      title: 'Termini di Servizio',
      lastUpdated: '2025-10-22T14:00:00Z',
      lastUpdatedLabel: 'Ultimo aggiornamento:',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
      metaTitle: 'Termini di Servizio',
      metaDescription: 'Termini di Servizio di Affilibuster - I nostri termini e condizioni.',
      metaKeywords: [],
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::term.term',
    'he',
    {
      entryTitle: 'Terms of Service',
      title: 'תנאי השירות',
      lastUpdated: '2025-10-22T14:00:00Z',
      lastUpdatedLabel: 'עדכון אחרון:',
      content:
        'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט, סד דו אימוד טמפורס אינקידידונט אוט לבורה את דולר מגנה אליקווה. יוטא אנים אד מינים ווניאם, קוויס נוסטרוד אקסרסיטציון וללמקו לאבוריס ניסי וט אליקוויפ אקס אא קוממודו קונסקוויאט. דויס אוטה אירורה דולר ין רפריהנדרית ין ווולופטאטה ווליט אסה קילום דולורה או פוגיאט נוללא פאריאטור. אקסקפטור סינט אוקקאקאט קופידאטאט נון פרואידנט, סונט ין קולפא קוי אופיציא דאסרונט מוללית אנים יד אסט לאבורום. סד וט פרספיקטטיס ונדה אומניס יסטה נאטוס אררור סיט ווולופטאטם אקוסנטיום דולוררמקא לאודנטיום, טוטם רם אפריאם, אקוא יפסא קוא אב יללו ינוונטורה ווריטטיס אט קוואסי אארכיטקטו באטא ווטא דיקטא סונט אקספליקאבו.',
      metaTitle: 'תנאי השירות',
      metaDescription: 'תנאי השירות של Affilibuster - התנאים וההוראות שלנו.',
      metaKeywords: [],
    },
    state
  )

  console.log('')

  // Product page single type
  console.log('📝 Populating product-page...')
  await updateSingleType(
    strapi,
    'api::product-page.product-page',
    'en',
    {
      entryTitle: 'Products',
      title: 'Our Products',
      subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      description:
        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
      previousButton: 'Previous',
      nextButton: 'Next',
      noProductsMessage: 'No products found. Please try adjusting your search or filters.',
      showingText: 'Showing {count} of {total}',
      pageText: 'Page {current} of {total}',
      itemsPerPage: 12,
      metaTitle: 'Products - Affilibuster',
      metaDescription: 'Browse our curated collection of products in multiple languages.',
      metaKeywords: [],
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::product-page.product-page',
    'it',
    {
      entryTitle: 'Products',
      title: 'I Nostri Prodotti',
      subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      description:
        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
      previousButton: 'Precedente',
      nextButton: 'Successivo',
      noProductsMessage: 'Nessun prodotto trovato. Prova a modificare la ricerca o i filtri.',
      showingText: 'Mostrando {count} di {total}',
      pageText: 'Pagina {current} di {total}',
      itemsPerPage: 12,
      metaTitle: 'Prodotti - Affilibuster',
      metaDescription: 'Sfoglia la nostra collezione curata di prodotti in più lingue.',
      metaKeywords: [],
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::product-page.product-page',
    'he',
    {
      entryTitle: 'Products',
      title: 'המוצרים שלנו',
      subtitle: 'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט.',
      description:
        '<p>לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט, סד דו אימוד טמפורס אינקידידונט אוט לבורה את דולר מגנה אליקווה.</p>',
      previousButton: 'הקודם',
      nextButton: 'הבא',
      noProductsMessage: 'לא נמצאו מוצרים. אנא נסה לשנות את החיפוש או את הסינון.',
      showingText: 'מוצגים {count} מתוך {total}',
      pageText: 'עמוד {current} מתוך {total}',
      itemsPerPage: 12,
      metaTitle: 'מוצרים - Affilibuster',
      metaDescription: 'עיין בקולקציה הקוראת שלנו של מוצרים בשפות מרובות.',
      metaKeywords: [],
    },
    state
  )

  console.log('')

  // Error 404 single type
  console.log('📝 Populating error-404...')
  await updateSingleType(
    strapi,
    'api::error-404.error-404',
    'en',
    {
      entryTitle: 'Error 404: Page Not Found',
      title: 'Page Not Found',
      subtitle: 'Oops! The page you are looking for does not exist.',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. The page may have been moved or deleted.',
      ctaText: 'Go to Homepage',
      secondaryCtaText: 'Browse Products',
      metaTitle: '404 - Page Not Found',
      metaDescription: 'The page you are looking for does not exist.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::error-404.error-404',
    'it',
    {
      entryTitle: 'Error 404: Page Not Found',
      title: 'Pagina Non Trovata',
      subtitle: 'Ops! La pagina che stai cercando non esiste.',
      message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. La pagina potrebbe essere stata spostata o eliminata.',
      ctaText: 'Vai alla Homepage',
      secondaryCtaText: 'Sfoglia Prodotti',
      metaTitle: '404 - Pagina Non Trovata',
      metaDescription: 'La pagina che stai cercando non esiste.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::error-404.error-404',
    'he',
    {
      entryTitle: 'Error 404: Page Not Found',
      title: 'עמוד לא נמצא',
      subtitle: 'אופס! העמוד שאתה מחפש אינו קיים.',
      message: 'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט. ייתכן שהעמוד הועבר או נמחק.',
      ctaText: 'חזור לדף הבית',
      secondaryCtaText: 'עיין במוצרים',
      metaTitle: '404 - עמוד לא נמצא',
      metaDescription: 'העמוד שאתה מחפש אינו קיים.',
    },
    state
  )

  console.log('')

  // Error 410 single type
  console.log('📝 Populating error-410...')
  await updateSingleType(
    strapi,
    'api::error-410.error-410',
    'en',
    {
      entryTitle: 'Error 410: Page Gone',
      title: '410 Error',
      subtitle: 'Page Gone',
      message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. This page has been permanently removed and is no longer available.',
      ctaText: 'Go to Homepage',
      supportContactMessage: 'If you believe this is an error, please contact support.',
      metaTitle: '410 - Page Gone',
      metaDescription: 'This page has been permanently removed and is no longer available.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::error-410.error-410',
    'it',
    {
      entryTitle: 'Error 410: Page Gone',
      title: '410 Errore',
      subtitle: 'Pagina Rimossa',
      message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Questa pagina è stata rimossa permanentemente e non è più disponibile.',
      ctaText: 'Vai alla Homepage',
      supportContactMessage: 'Se credi che sia un errore, contatta il supporto.',
      metaTitle: '410 - Pagina Rimossa',
      metaDescription: 'Questa pagina è stata rimossa permanentemente e non è più disponibile.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::error-410.error-410',
    'he',
    {
      entryTitle: 'Error 410: Page Gone',
      title: 'שגיאה 410',
      subtitle: 'עמוד שנמחק',
      message: 'לורם איפסום דולר סיט אמט, קונסקטטור אדיפיסינג אליט. עמוד זה הוסר לצמיתות והוא כבר לא זמין.',
      ctaText: 'חזור לדף הבית',
      supportContactMessage: 'אם אתה חושב שזו שגיאה, אנא צור קשר עם התמיכה.',
      metaTitle: '410 - עמוד שנמחק',
      metaDescription: 'עמוד זה הוסר לצמיתות והוא כבר לא זמין.',
    },
    state
  )

  console.log('')

  // System messages single type
  console.log('📝 Populating system-message...')
  await updateSingleType(
    strapi,
    'api::system-message.system-message',
    'en',
    {
      entryTitle: 'System Messages',
      unknownErrorMessage: 'Unknown Error',
      networkErrorMessage: 'Network error',
      unexpectedErrorMessage: 'An unexpected error occurred',
      translationNotAvailableTitle: 'Translation not available',
      translationNotAvailableMessage: 'This content is not yet available in your language. Please check back soon.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::system-message.system-message',
    'it',
    {
      entryTitle: 'System Messages',
      unknownErrorMessage: 'Errore Sconosciuto',
      networkErrorMessage: 'Errore di rete',
      unexpectedErrorMessage: 'Si è verificato un errore imprevisto',
      translationNotAvailableTitle: 'Traduzione non disponibile',
      translationNotAvailableMessage:
        'Questo contenuto non è ancora disponibile nella tua lingua. Controlla di nuovo presto.',
    },
    state
  )

  await updateSingleType(
    strapi,
    'api::system-message.system-message',
    'he',
    {
      entryTitle: 'System Messages',
      unknownErrorMessage: 'שגיאה לא ידועה',
      networkErrorMessage: 'שגיאת רשת',
      unexpectedErrorMessage: 'אירעה שגיאה בלתי צפויה',
      translationNotAvailableTitle: 'תרגום לא זמין',
      translationNotAvailableMessage: 'תוכן זה עדיין אינו זמין בשפה שלך. בדוק שוב בקרוב.',
    },
    state
  )

  console.log('')

  // Products
  console.log('📝 Populating products...')

  await updateProduct(
    strapi,
    'Premium Wireless Earbuds',
    'en',
    'High-quality wireless earbuds with noise cancellation',
    'Experience crystal-clear audio with our premium wireless earbuds. Features active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals alike. These earbuds combine comfort, style, and cutting-edge technology for an unmatched audio experience. The ergonomic design ensures all-day comfort, while the advanced microphone technology provides crystal-clear calls.',
    'High-quality wireless earbuds with noise cancellation and 30-hour battery',
    'https://example.com/earbuds',
    79.99,
    'USD',
    'Electronics',
    true,
    state
  )

  await updateProduct(
    strapi,
    'Smart Fitness Watch',
    'en',
    'Advanced fitness tracking smartwatch with health monitoring',
    'Stay connected and track your fitness with our advanced smartwatch. Monitor heart rate, sleep quality, and daily activity with precision sensors. Receive notifications, make calls, and access apps directly from your wrist. With a vibrant AMOLED display and 7-day battery life, this smartwatch is your perfect companion for active lifestyle. Water-resistant design makes it suitable for swimming and water sports.',
    'Advanced smartwatch with fitness tracking and health monitoring features',
    'https://example.com/smartwatch',
    199.99,
    'USD',
    'Electronics',
    true,
    state
  )

  await updateProduct(
    strapi,
    'Portable Fast Charging Power Bank',
    'en',
    '20000mAh portable charger with 65W fast charging',
    'Never run out of battery again with our high-capacity power bank. Features 20000mAh capacity with 65W fast charging technology. Charge your smartphone from 0 to 100% in just 30 minutes. The compact design fits easily in your pocket, and the durable construction ensures long-lasting performance. Supports multiple devices simultaneously with advanced safety features.',
    '20000mAh power bank with 65W fast charging for multiple devices',
    'https://example.com/powerbank',
    39.99,
    'USD',
    'Electronics',
    true,
    state
  )

  await updateProduct(
    strapi,
    'Mechanical Gaming Keyboard RGB',
    'en',
    'Professional mechanical keyboard with customizable RGB lighting',
    'Elevate your gaming and productivity with our mechanical keyboard. Features premium mechanical switches with satisfying tactile feedback. Customizable RGB lighting with multiple preset modes. The aluminum frame provides durability while the ergonomic layout reduces fatigue during long sessions. Hot-swap switches allow for easy customization. Compatible with Windows, Mac, and Linux systems.',
    'Professional mechanical keyboard with RGB lighting and hot-swap switches',
    'https://example.com/keyboard',
    129.99,
    'USD',
    'Electronics',
    false,
    state
  )

  await updateProduct(
    strapi,
    'Auricolari Wireless Premium',
    'it',
    'Auricolari wireless di alta qualità con cancellazione del rumore',
    "Vivi un'esperienza audio cristallina con i nostri auricolari wireless premium. Caratteristiche: cancellazione del rumore attiva, autonomia di 30 ore e qualità audio superiore. Perfetti per gli amanti della musica e i professionisti. Il design ergonomico garantisce comfort tutto il giorno, mentre la tecnologia microfonica avanzata fornisce chiamate cristalline. La custodia di ricarica premium con display LED mostra lo stato della batteria.",
    'Auricolari wireless di alta qualità con cancellazione del rumore e 30 ore di autonomia',
    'https://example.com/auricolari',
    79.99,
    'EUR',
    'Elettronica',
    true,
    state
  )

  await updateProduct(
    strapi,
    'Smartwatch Fitness Avanzato',
    'it',
    'Smartwatch avanzato con monitoraggio della salute e del fitness',
    "Rimani connesso e monitora il tuo fitness con il nostro smartwatch avanzato. Monitora la frequenza cardiaca, la qualità del sonno e l'attività giornaliera con sensori di precisione. Ricevi notifiche, effettua chiamate e accedi alle app direttamente dal polso. Con display AMOLED vibrante e autonomia di 7 giorni, questo smartwatch è il tuo compagno perfetto per uno stile di vita attivo. Il design impermeabile lo rende adatto per nuoto e sport acquatici.",
    'Smartwatch avanzato con monitoraggio del fitness e funzioni di monitoraggio della salute',
    'https://example.com/smartwatch-it',
    199.99,
    'EUR',
    'Elettronica',
    true,
    state
  )

  // Currencies
  console.log('')
  console.log('📝 Populating system metadata (currencies)...')

  await updateCurrency(strapi, 'USD', 'US Dollar', '$', 2, 'before', ',', '.', 1.0, 1, state)
  await updateCurrency(strapi, 'EUR', 'Euro', '€', 2, 'after', '.', ',', 0.92, 2, state)
  await updateCurrency(strapi, 'GBP', 'British Pound', '£', 2, 'before', ',', '.', 0.79, 3, state)
  await updateCurrency(strapi, 'ILS', 'Israeli Shekel', '₪', 2, 'before', ',', '.', 3.65, 4, state)
  await updateCurrency(strapi, 'CAD', 'Canadian Dollar', '$', 2, 'before', ',', '.', 1.36, 5, state)
  await updateCurrency(strapi, 'AUD', 'Australian Dollar', '$', 2, 'before', ',', '.', 1.54, 6, state)
  await updateCurrency(strapi, 'JPY', 'Japanese Yen', '¥', 0, 'before', ',', '.', 149.5, 7, state)
  await updateCurrency(strapi, 'CNY', 'Chinese Yuan', '¥', 2, 'before', ',', '.', 7.24, 8, state)

  console.log('')

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Population Summary:')
  console.log(`   ✅ Success: ${state.successCount}`)
  console.log(`   ❌ Failed:  ${state.failureCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  if (state.failureCount === 0) {
    console.log('🎉 All types populated successfully!')
  } else {
    console.log('⚠️  Some types failed to populate. Check logs above for details.')
    throw Error('Population script encountered errors.')
  }
}
