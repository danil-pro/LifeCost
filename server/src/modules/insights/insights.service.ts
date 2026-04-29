import { PrismaClient } from '@prisma/client';
import type { Insight, BreakdownItem } from './insights.types';

const prisma = new PrismaClient();

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const insightsService = {
  async costOfLiving(userId: string, month?: string) {
    const targetMonth = month || getCurrentMonth();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true },
    });

    const expenses = await prisma.expense.findMany({
      where: { userId, month: targetMonth },
    });

    const monthly = expenses.reduce((sum, e) => sum + e.amount, 0);
    const daily = monthly / 30;
    const hourly = monthly / 730;

    const incomes = await prisma.income.findMany({
      where: { userId, month: targetMonth },
    });
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const disposableIncome = totalIncome - monthly;

    return {
      month: targetMonth,
      monthly: Math.round(monthly * 100) / 100,
      daily: Math.round(daily * 100) / 100,
      hourly: Math.round(hourly * 100) / 100,
      currency: user?.currency || 'USD',
      disposableIncome: Math.round(disposableIncome * 100) / 100,
    };
  },

  async breakdown(userId: string, month?: string): Promise<BreakdownItem[]> {
    const targetMonth = month || getCurrentMonth();

    const expenses = await prisma.expense.findMany({
      where: { userId, month: targetMonth },
      include: { category: true },
    });

    const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    if (grandTotal === 0) return [];

    const byCategory: Record<string, { categoryId: string; categoryName: string; categoryNameRu: string | null; total: number }> = {};
    for (const expense of expenses) {
      const key = expense.categoryId;
      if (!byCategory[key]) {
        byCategory[key] = {
          categoryId: expense.categoryId,
          categoryName: expense.category.name,
          categoryNameRu: expense.category.nameRu,
          total: 0,
        };
      }
      byCategory[key].total += expense.amount;
    }

    const items: BreakdownItem[] = Object.values(byCategory).map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      categoryNameRu: item.categoryNameRu,
      total: Math.round(item.total * 100) / 100,
      percentage: Math.round((item.total / grandTotal) * 10000) / 100,
    }));

    return items.sort((a, b) => b.total - a.total);
  },

  async insights(userId: string, month?: string): Promise<Insight[]> {
    const targetMonth = month || getCurrentMonth();
    const result: Insight[] = [];

    const expenses = await prisma.expense.findMany({
      where: { userId, month: targetMonth },
      include: { category: true },
    });

    const incomes = await prisma.income.findMany({
      where: { userId, month: targetMonth },
    });
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    if (totalExpenses === 0) {
      return [{ type: 'info', title: 'No expenses', description: 'No expenses recorded for this month' }];
    }

    // Aggregate by category
    const byCategory: Record<string, { categoryName: string; total: number }> = {};
    for (const expense of expenses) {
      const key = expense.categoryId;
      if (!byCategory[key]) {
        byCategory[key] = {
          categoryName: expense.category.name,
          total: 0,
        };
      }
      byCategory[key].total += expense.amount;
    }

    // Rule 1: Categories where spending >= 15% of total
    for (const item of Object.values(byCategory)) {
      const pct = Math.round((item.total / totalExpenses) * 10000) / 100;
      if (pct >= 15) {
        result.push({
          type: 'warning',
          title: 'High category spending',
          description: `${pct}% of your income goes to ${item.categoryName}`,
          percentage: pct,
          amount: Math.round(item.total * 100) / 100,
        });
      }
    }

    // Rule 2: Subscriptions > 10% of budget
    const subCategory = Object.entries(byCategory).find(
      ([, v]) => v.categoryName.toLowerCase() === 'subscriptions',
    );
    if (subCategory) {
      const pct = Math.round((subCategory[1].total / totalExpenses) * 10000) / 100;
      if (pct > 10) {
        result.push({
          type: 'warning',
          title: 'Subscription spending',
          description: `Subscriptions = ${pct}% of your budget`,
          percentage: pct,
          amount: Math.round(subCategory[1].total * 100) / 100,
        });
      }
    }

    // Rule 3: Small purchases (under $10)
    const smallPurchases = expenses.filter((e) => e.amount < 10);
    const smallTotal = smallPurchases.reduce((sum, e) => sum + e.amount, 0);
    if (smallTotal > 0) {
      result.push({
        type: 'info',
        title: 'Small purchases',
        description: `You spent $${Math.round(smallTotal * 100) / 100} on small purchases`,
        amount: Math.round(smallTotal * 100) / 100,
      });
    }

    // Rule 4: Disposable income < 10% of income
    if (totalIncome > 0) {
      const disposableIncome = totalIncome - totalExpenses;
      const disposablePct = Math.round((disposableIncome / totalIncome) * 10000) / 100;
      if (disposablePct < 10) {
        result.push({
          type: 'warning',
          title: 'Low disposable income',
          description: `Your disposable income is only ${disposablePct}% of your total income`,
          percentage: disposablePct,
          amount: Math.round(disposableIncome * 100) / 100,
        });
      }
    }

    return result;
  },
};
