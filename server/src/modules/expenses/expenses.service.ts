import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getMonthFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const expensesService = {
  async create(userId: string, data: {
    amount: number;
    categoryId: string;
    description?: string;
    date?: string;
  }) {
    const expenseDate = data.date ? new Date(data.date) : new Date();
    const month = getMonthFromDate(expenseDate);

    const expense = await prisma.expense.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description,
        expenseDate,
        month,
      },
      include: {
        category: true,
      },
    });

    return expense;
  },

  async quickAdd(userId: string, amount: number, categoryId?: string) {
    let resolvedCategoryId = categoryId;

    if (!resolvedCategoryId) {
      const quickCategory = await prisma.category.findFirst({
        where: {
          name: 'Quick Expenses',
          OR: [{ userId }, { userId: null }],
        },
      });

      if (quickCategory) {
        resolvedCategoryId = quickCategory.id;
      } else {
        // Fallback: any variable category
        const anyVariable = await prisma.category.findFirst({
          where: {
            type: 'variable',
            OR: [{ userId }, { userId: null }],
          },
        });
        if (anyVariable) {
          resolvedCategoryId = anyVariable.id;
        } else {
          throw new Error('No category available for quick expense');
        }
      }
    }

    const now = new Date();
    const month = getMonthFromDate(now);

    const expense = await prisma.expense.create({
      data: {
        userId,
        categoryId: resolvedCategoryId,
        amount,
        expenseDate: now,
        month,
      },
      include: {
        category: true,
      },
    });

    return expense;
  },

  async list(userId: string, month?: string, categoryId?: string, page?: number, limit?: number) {
    const where: any = { userId };

    if (month) {
      where.month = month;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const pageNum = Math.max(1, page || 1);
    const limitNum = Math.min(100, Math.max(1, limit || 20));
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { expenseDate: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      expenses,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  async summary(userId: string, month: string) {
    const expenses = await prisma.expense.findMany({
      where: { userId, month },
      include: { category: true },
    });

    const grandTotal = expenses.reduce((sum: number, e) => sum + e.amount, 0);

    const byCategory: Record<string, { categoryId: string; categoryName: string; categoryNameRu: string | null; categoryType: string; total: number }> = {};
    for (const expense of expenses) {
      const key = expense.categoryId;
      if (!byCategory[key]) {
        byCategory[key] = {
          categoryId: expense.categoryId,
          categoryName: expense.category.name,
          categoryNameRu: expense.category.nameRu,
          categoryType: expense.category.type,
          total: 0,
        };
      }
      byCategory[key].total += expense.amount;
    }

    const categories = Object.values(byCategory).map((c) => ({
      ...c,
      percentage: grandTotal > 0 ? Math.round((c.total / grandTotal) * 1000) / 10 : 0,
    }));

    const totalFixed = categories
      .filter((c) => c.categoryType === 'fixed')
      .reduce((sum: number, c) => sum + c.total, 0);

    const totalVariable = categories
      .filter((c) => c.categoryType === 'variable')
      .reduce((sum: number, c) => sum + c.total, 0);

    return {
      month,
      grandTotal,
      totalFixed,
      totalVariable,
      categories,
    };
  },

  async update(userId: string, id: string, data: {
    amount?: number;
    categoryId?: string;
    description?: string;
    date?: string;
  }) {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    const updateData: any = {};

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.description !== undefined) updateData.description = data.description;

    if (data.date !== undefined) {
      const expenseDate = new Date(data.date);
      updateData.expenseDate = expenseDate;
      updateData.month = getMonthFromDate(expenseDate);
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return updated;
  },

  async remove(userId: string, id: string) {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    await prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted' };
  },
};
