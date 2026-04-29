/**
 * Shared calculation helpers used across multiple modules.
 */

export function getDaysInMonth(month: string): number {
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  return new Date(year, monthNum, 0).getDate();
}

export function calculateCostPerHour(monthlyTotal: number): number {
  return Math.round((monthlyTotal / 730) * 100) / 100;
}

export function calculateCostPerDay(monthlyTotal: number, month: string): number {
  const days = getDaysInMonth(month);
  return Math.round((monthlyTotal / days) * 100) / 100;
}

export function calculateDisposableIncome(income: number, expenses: number): number {
  return Math.round((income - expenses) * 100) / 100;
}

export function calculateSavingsRate(income: number, savings: number): number {
  if (income <= 0) return 0;
  return Math.round((savings / income) * 10000) / 100;
}
