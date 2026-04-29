import { create } from 'zustand';

// Rates relative to USD
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  UAH: 41.5,
  PLN: 3.95,
  CZK: 23.2,
  CAD: 1.37,
  AUD: 1.55,
  CHF: 0.88,
  JPY: 149.5,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  UAH: '₴',
  PLN: 'zł',
  CZK: 'Kč',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'CHF',
  JPY: '¥',
};

const CURRENCY_NAMES: Record<string, Record<string, string>> = {
  USD: { en: 'US Dollar', ru: 'Доллар США' },
  EUR: { en: 'Euro', ru: 'Евро' },
  GBP: { en: 'British Pound', ru: 'Фунт стерлингов' },
  UAH: { en: 'Ukrainian Hryvnia', ru: 'Украинская гривна' },
  PLN: { en: 'Polish Zloty', ru: 'Польский злотый' },
  CZK: { en: 'Czech Koruna', ru: 'Чешская крона' },
  CAD: { en: 'Canadian Dollar', ru: 'Канадский доллар' },
  AUD: { en: 'Australian Dollar', ru: 'Австралийский доллар' },
  CHF: { en: 'Swiss Franc', ru: 'Швейцарский франк' },
  JPY: { en: 'Japanese Yen', ru: 'Японская иена' },
};

export const SUPPORTED_CURRENCIES = Object.keys(EXCHANGE_RATES);

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] || code;
}

export function getCurrencyName(code: string, locale: string): string {
  return CURRENCY_NAMES[code]?.[locale] || CURRENCY_NAMES[code]?.en || code;
}

/** Convert amount between any two currencies via USD */
function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const inUsd = amount / (EXCHANGE_RATES[from] || 1);
  return inUsd * (EXCHANGE_RATES[to] || 1);
}

interface CurrencyState {
  /** Display currency (what the user sees) */
  currency: string;
  /** Base currency (what data is stored in — user's profile currency) */
  baseCurrency: string;
  setCurrency: (currency: string) => void;
  setBaseCurrency: (currency: string) => void;
  /** Convert DB amount (in baseCurrency) to display currency */
  convert: (amount: number) => number;
  /** Convert DB amount to display currency and format */
  formatAmount: (amount: number) => string;
  /** Convert user-input amount (in display currency) to baseCurrency for API */
  toBase: (amount: number) => number;
}

const CURRENCY_KEY = 'lifecost-currency';
const BASE_KEY = 'lifecost-base-currency';
const savedCurrency = localStorage.getItem(CURRENCY_KEY) || 'USD';
const savedBase = localStorage.getItem(BASE_KEY) || 'USD';

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: savedCurrency,
  baseCurrency: savedBase,

  setCurrency: (currency) => {
    localStorage.setItem(CURRENCY_KEY, currency);
    set({ currency });
  },

  setBaseCurrency: (baseCurrency) => {
    localStorage.setItem(BASE_KEY, baseCurrency);
    set({ baseCurrency });
  },

  /** DB amount → display amount */
  convert: (amount) => {
    return convertCurrency(amount, get().baseCurrency, get().currency);
  },

  /** DB amount → formatted display string */
  formatAmount: (amount) => {
    const converted = get().convert(amount);
    const cur = get().currency;
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: cur,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted);
    } catch {
      return `${CURRENCY_SYMBOLS[cur] || cur} ${converted.toFixed(2)}`;
    }
  },

  /** User input (display currency) → base currency for API */
  toBase: (amount) => {
    return convertCurrency(amount, get().currency, get().baseCurrency);
  },
}));
