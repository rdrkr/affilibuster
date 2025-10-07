// Copyright (c) 2025 Affilibuster by Ronen Druker.

/**
 * Currency Selector Component
 * Reference: T110 (CurrencySelector component)
 * Allows users to select their preferred currency
 */

'use client';

import { useState, useEffect } from 'react';
import { currenciesAPI, preferencesAPI } from '@/lib/api';
import { Currency } from '@/types/api';
import { useSession } from '@/hooks/useSession';

export function CurrencySelector() {
  const sessionId = useSession();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    // Fetch currencies and user preferences
    Promise.all([
      currenciesAPI.getAll(),
      preferencesAPI.get().catch(() => null),
    ])
      .then(([currenciesData, prefsData]) => {
        setCurrencies(currenciesData);
        if (prefsData) {
          setSelectedCurrency(prefsData.selectedCurrency);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleCurrencyChange = async (currencyCode: string) => {
    try {
      await preferencesAPI.update({ selectedCurrency: currencyCode });
      setSelectedCurrency(currencyCode);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
    );
  }

  const current = currencies.find((c) => c.code === selectedCurrency);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select currency"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium">
          {current?.symbol} {current?.code}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currency.code === selectedCurrency
                    ? 'bg-gray-50 dark:bg-gray-700 font-medium'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {currency.symbol} {currency.code}
                  </span>
                  <span className="text-xs text-gray-500">
                    {currency.displayName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
