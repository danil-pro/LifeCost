export const Currencies = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '\u20AC', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '\u00A3', name: 'British Pound' },
  UAH: { code: 'UAH', symbol: '\u20B4', name: 'Ukrainian Hryvnia' },
  PLN: { code: 'PLN', symbol: 'z\u0142', name: 'Polish Zloty' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  JPY: { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen' },
  CNY: { code: 'CNY', symbol: '\u00A5', name: 'Chinese Yuan' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
} as const;

export type CurrencyCode = keyof typeof Currencies;

export const ExpenseType = {
  FIXED: 'fixed',
  VARIABLE: 'variable',
} as const;

export type ExpenseTypeValue = (typeof ExpenseType)[keyof typeof ExpenseType];

export const Tier = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export type TierValue = (typeof Tier)[keyof typeof Tier];

export const IncomeFrequency = {
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  YEARLY: 'yearly',
  ONE_TIME: 'one-time',
} as const;

export type IncomeFrequencyValue = (typeof IncomeFrequency)[keyof typeof IncomeFrequency];
