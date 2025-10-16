// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Privacy Policy Page
 * Static page available in all languages
 */

import { setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;

  return {
    title: 'Privacy Policy | Affilibuster',
    description: 'Privacy Policy for Affilibuster - Learn how we protect your data',
  };
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'it' }, { lang: 'il' }];
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;

  // Enable static rendering
  setRequestLocale(lang);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          Last updated: January 17, 2025
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
        <p>
          Welcome to Affilibuster. We respect your privacy and are committed to protecting your personal data.
          This privacy policy will inform you about how we look after your personal data and tell you about
          your privacy rights.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
        <p>We collect and process the following types of information:</p>
        <ul>
          <li>
            <strong>Usage Data:</strong> Information about how you use our website, including your language
            and currency preferences
          </li>
          <li>
            <strong>Browser Data:</strong> Information about your browser, including language preferences
            for automatic language detection
          </li>
          <li>
            <strong>Session Data:</strong> Temporary session identifiers to maintain your preferences
            during your visit
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and improve our services</li>
          <li>Remember your language and currency preferences</li>
          <li>Analyze usage patterns to enhance user experience</li>
          <li>Ensure the security and integrity of our platform</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Data Storage and Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data.
          Your preferences are stored securely using session-based storage and are not shared with third parties
          without your consent.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Withdraw consent at any time</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Cookies</h2>
        <p>
          We use essential cookies to maintain your session and remember your preferences. These cookies are
          necessary for the website to function properly.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible for the privacy
          practices of these websites. We recommend reviewing their privacy policies.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes by posting
          the new privacy policy on this page and updating the "Last updated" date.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or our privacy practices, please contact us at:
        </p>
        <p>
          <a href="mailto:privacy@affilibuster.com" className="text-secondary-600 hover:underline">
            privacy@affilibuster.com
          </a>
        </p>
      </div>
    </div>
  );
}
