/**
 * Simple currency info map for the LifeCost MVP.
 * Can be replaced with an external API later.
 */

const CURRENCY_MAP: Record<string, { code: string; name: string; symbol: string }> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '\u20AC' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '\u00A3' },
  UAH: { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '\u20B4' },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'z\u0142' },
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_MAP[code]?.symbol || code;
}

export function getSupportedCurrencies(): { code: string; name: string; symbol: string }[] {
  return Object.values(CURRENCY_MAP);
}
