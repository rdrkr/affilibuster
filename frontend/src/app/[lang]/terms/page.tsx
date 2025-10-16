// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Terms of Service Page
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
    title: 'Terms of Service | Affilibuster',
    description: 'Terms of Service for Affilibuster - Read our terms and conditions',
  };
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'it' }, { lang: 'il' }];
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params;

  // Enable static rendering
  setRequestLocale(lang);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          Last updated: January 17, 2025
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Agreement to Terms</h2>
        <p>
          By accessing and using Affilibuster, you accept and agree to be bound by the terms and provisions
          of this agreement. If you do not agree to these terms, please do not use our services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Use of Our Service</h2>
        <p>
          Affilibuster provides a multi-language affiliate platform for discovering and comparing products
          across different languages and currencies. You agree to use our service only for lawful purposes
          and in accordance with these Terms of Service.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">User Responsibilities</h2>
        <p>As a user of our service, you agree to:</p>
        <ul>
          <li>Provide accurate and complete information when using our services</li>
          <li>Maintain the security of your session and account information</li>
          <li>Not attempt to gain unauthorized access to our systems or networks</li>
          <li>Not use our service for any illegal or unauthorized purpose</li>
          <li>Not interfere with or disrupt the integrity or performance of our service</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Intellectual Property</h2>
        <p>
          All content, features, and functionality on Affilibuster, including but not limited to text,
          graphics, logos, and software, are the exclusive property of Affilibuster and are protected by
          international copyright, trademark, and other intellectual property laws.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Affiliate Links</h2>
        <p>
          Affilibuster may contain affiliate links to third-party products and services. We may receive
          compensation when you click on or make purchases through these links. This does not affect the
          price you pay, and we only recommend products we believe will provide value to our users.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Content</h2>
        <p>
          Product information, descriptions, and pricing displayed on Affilibuster are provided by third
          parties. While we strive to maintain accuracy, we cannot guarantee that all information is
          current, complete, or error-free. We are not responsible for any errors or omissions in
          third-party content.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Affilibuster shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages resulting from your use or inability to
          use our service.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Disclaimer of Warranties</h2>
        <p>
          Our service is provided "as is" and "as available" without any warranties of any kind, either
          express or implied, including but not limited to implied warranties of merchantability, fitness
          for a particular purpose, and non-infringement.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms of Service at any time. We will provide
          notice of any significant changes by posting the new Terms of Service on this page and updating
          the "Last updated" date.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Governing Law</h2>
        <p>
          These Terms of Service shall be governed by and construed in accordance with the laws of the
          jurisdiction in which Affilibuster operates, without regard to its conflict of law provisions.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <p>
          <a href="mailto:legal@affilibuster.com" className="text-secondary-600 hover:underline">
            legal@affilibuster.com
          </a>
        </p>
      </div>
    </div>
  );
}
