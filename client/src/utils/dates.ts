/**
 * Get current month in "YYYY-MM" format.
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get the number of days in a given month.
 * @param month - Month string in "YYYY-MM" format
 */
export function getDaysInMonth(month: string): number {
  const [year, mon] = month.split('-').map(Number);
  return new Date(year, mon, 0).getDate();
}

/**
 * Format a month string into a localized month name.
 * @param month - Month string in "YYYY-MM" format
 * @param locale - Locale string (e.g. 'en', 'ru')
 */
export function formatMonth(month: string, locale: string = 'en'): string {
  const [year, mon] = month.split('-').map(Number);
  const date = new Date(year, mon - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  }).format(date);
}
