import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const simulationsService = {
  async simulate(
    userId: string,
    adjustments: { categoryId: string; newAmount: number }[],
    month?: string,
  ) {
    const targetMonth = month || getCurrentMonth();

    const expenses = await prisma.expense.findMany({
      where: { userId, month: targetMonth },
      include: { category: true },
    });

    const currentTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    const adjustmentMap = new Map(adjustments.map((a) => [a.categoryId, a.newAmount]));

    let simulatedTotal = 0;
    const changes: {
      categoryId: string;
      categoryName: string;
      currentAmount: number;
      newAmount: number;
      difference: number;
    }[] = [];

    // Aggregate current expenses by category
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

    // Calculate simulated totals
    for (const [categoryId, data] of Object.entries(byCategory)) {
      const adjustedAmount = adjustmentMap.get(categoryId);
      const finalAmount = adjustedAmount !== undefined ? adjustedAmount : data.total;
      simulatedTotal += finalAmount;

      if (adjustedAmount !== undefined) {
        changes.push({
          categoryId,
          categoryName: data.categoryName,
          currentAmount: Math.round(data.total * 100) / 100,
          newAmount: Math.round(adjustedAmount * 100) / 100,
          difference: Math.round((adjustedAmount - data.total) * 100) / 100,
        });
      }
    }

    // Include categories in adjustments that have no current expenses
    for (const adj of adjustments) {
      if (!byCategory[adj.categoryId]) {
        const category = await prisma.category.findUnique({
          where: { id: adj.categoryId },
        });
        if (category) {
          simulatedTotal += adj.newAmount;
          changes.push({
            categoryId: adj.categoryId,
            categoryName: category.name,
            currentAmount: 0,
            newAmount: Math.round(adj.newAmount * 100) / 100,
            difference: Math.round(adj.newAmount * 100) / 100,
          });
        }
      }
    }

    const savings = Math.round((currentTotal - simulatedTotal) * 100) / 100;

    return {
      month: targetMonth,
      currentTotal: Math.round(currentTotal * 100) / 100,
      simulatedTotal: Math.round(simulatedTotal * 100) / 100,
      savings,
      changes,
    };
  },

  async coffeeCut(userId: string, percent: number, month?: string) {
    const targetMonth = month || getCurrentMonth();

    const coffeeCategory = await prisma.category.findFirst({
      where: {
        name: 'Coffee',
        OR: [{ userId }, { userId: null }],
      },
    });

    if (!coffeeCategory) {
      throw new Error('No coffee category found');
    }

    const coffeeExpenses = await prisma.expense.findMany({
      where: {
        userId,
        month: targetMonth,
        categoryId: coffeeCategory.id,
      },
    });

    const currentTotal = coffeeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const cutAmount = currentTotal * (percent / 100);
    const newTotal = currentTotal - cutAmount;

    return {
      month: targetMonth,
      category: coffeeCategory.name,
      percent,
      currentSpending: Math.round(currentTotal * 100) / 100,
      newSpending: Math.round(newTotal * 100) / 100,
      savings: Math.round(cutAmount * 100) / 100,
      transactionsCount: coffeeExpenses.length,
    };
  },

  async stupidSpending(userId: string, month?: string) {
    const targetMonth = month || getCurrentMonth();
    const THRESHOLD = 10;

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        month: targetMonth,
        amount: { lt: THRESHOLD },
      },
      include: { category: true },
    });

    const byCategory: Record<string, {
      category: string;
      categoryId: string;
      count: number;
      total: number;
      amounts: number[];
    }> = {};

    for (const expense of expenses) {
      const key = expense.categoryId;
      if (!byCategory[key]) {
        byCategory[key] = {
          category: expense.category.name,
          categoryId: expense.categoryId,
          count: 0,
          total: 0,
          amounts: [],
        };
      }
      byCategory[key].count += 1;
      byCategory[key].total += expense.amount;
      byCategory[key].amounts.push(expense.amount);
    }

    const results = Object.values(byCategory)
      .filter((item) => item.count >= 3)
      .map((item) => ({
        category: item.category,
        categoryId: item.categoryId,
        count: item.count,
        total: Math.round(item.total * 100) / 100,
        averageAmount: Math.round((item.total / item.count) * 100) / 100,
      }))
      .sort((a, b) => b.total - a.total);

    return results;
  },
};
