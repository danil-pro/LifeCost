import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const incomeService = {
  async create(userId: string, data: {
    amount: number;
    currency?: string;
    month: string;
    label?: string;
    isRecurring?: boolean;
  }) {
    const income = await prisma.income.create({
      data: {
        userId,
        amount: data.amount,
        currency: data.currency || 'USD',
        month: data.month,
        label: data.label,
        isRecurring: data.isRecurring ?? true,
      },
    });

    return income;
  },

  async list(userId: string, month?: string) {
    const where: any = { userId };
    if (month) {
      where.month = month;
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return incomes;
  },

  async getCurrent(userId: string) {
    const month = getCurrentMonth();
    const incomes = await prisma.income.findMany({
      where: { userId, month },
      orderBy: { createdAt: 'desc' },
    });

    const total = incomes.reduce((sum, income) => sum + income.amount, 0);

    return { month, incomes, total };
  },

  async update(userId: string, id: string, data: {
    amount?: number;
    currency?: string;
    month?: string;
    label?: string;
    isRecurring?: boolean;
  }) {
    const income = await prisma.income.findFirst({
      where: { id, userId },
    });

    if (!income) {
      throw new Error('Income record not found');
    }

    const updated = await prisma.income.update({
      where: { id },
      data,
    });

    return updated;
  },

  async remove(userId: string, id: string) {
    const income = await prisma.income.findFirst({
      where: { id, userId },
    });

    if (!income) {
      throw new Error('Income record not found');
    }

    await prisma.income.delete({ where: { id } });
    return { message: 'Income record deleted' };
  },
};
