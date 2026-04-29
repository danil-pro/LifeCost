/**
 * Calculate the cost of one hour of life based on monthly total expenses.
 * Average hours in a month: 730 (365 * 24 / 12)
 */
export function calculateCostPerHour(monthlyTotal: number): number {
  if (monthlyTotal <= 0) return 0;
  return monthlyTotal / 730;
}

/**
 * Calculate the cost of one day based on monthly total.
 */
export function calculateCostPerDay(monthlyTotal: number, daysInMonth: number = 30): number {
  if (monthlyTotal <= 0 || daysInMonth <= 0) return 0;
  return monthlyTotal / daysInMonth;
}

/**
 * Calculate disposable income: income minus total expenses.
 */
export function calculateDisposableIncome(income: number, expenses: number): number {
  return income - expenses;
}

/**
 * Calculate savings rate as a percentage.
 */
export function calculateSavingsRate(income: number, saved: number): number {
  if (income <= 0) return 0;
  return (saved / income) * 100;
}
