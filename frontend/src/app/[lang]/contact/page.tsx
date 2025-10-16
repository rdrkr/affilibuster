// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Contact Page
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
    title: 'Contact Us | Affilibuster',
    description: 'Get in touch with the Affilibuster team - We would love to hear from you',
  };
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'it' }, { lang: 'il' }];
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;

  // Enable static rendering
  setRequestLocale(lang);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in <span className="text-secondary-400">Touch</span>
            </h1>
            <p className="text-xl text-neutral-200">
              Have a question or feedback? We would love to hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* General Inquiries */}
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-primary-200 dark:border-primary-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-primary-100 dark:bg-primary-900 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">General Inquiries</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              For general questions about our platform
            </p>
            <a
              href="mailto:info@affilibuster.com"
              className="text-primary-600 dark:text-primary-400 hover:text-secondary-600 dark:hover:text-secondary-400 font-semibold inline-flex items-center gap-2 group"
            >
              <span>info@affilibuster.com</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Support */}
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-secondary-100 dark:bg-secondary-900 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Technical Support</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Need help with the platform?
            </p>
            <a
              href="mailto:support@affilibuster.com"
              className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 font-semibold inline-flex items-center gap-2 group"
            >
              <span>support@affilibuster.com</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Business */}
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-primary-200 dark:border-primary-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-primary-100 dark:bg-primary-900 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Business & Partnerships</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Interested in partnering with us?
            </p>
            <a
              href="mailto:business@affilibuster.com"
              className="text-primary-600 dark:text-primary-400 hover:text-secondary-600 dark:hover:text-secondary-400 font-semibold inline-flex items-center gap-2 group"
            >
              <span>business@affilibuster.com</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-secondary-100 dark:bg-secondary-900 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Privacy & Legal</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Questions about your data and privacy?
            </p>
            <a
              href="mailto:privacy@affilibuster.com"
              className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 font-semibold inline-flex items-center gap-2 group"
            >
              <span>privacy@affilibuster.com</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 p-8 rounded-2xl border border-primary-200 dark:border-primary-700 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-secondary-500 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">Response Time</h2>
              <p className="text-neutral-700 dark:text-neutral-200">
                We strive to respond to all inquiries within 24-48 hours during business
                days. For urgent technical issues, please mark your email subject with [URGENT] to help us prioritize your request.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800 p-8 rounded-2xl border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-start gap-4">
            <div className="bg-primary-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">Office Hours</h2>
              <p className="text-neutral-700 dark:text-neutral-200">
                Our team is available Monday through Friday, 9:00 AM - 6:00 PM (GMT). While we monitor emails
                outside of these hours, responses may be delayed until the next business day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
