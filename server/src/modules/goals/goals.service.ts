import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const goalsService = {
  async create(userId: string, data: {
    name: string;
    targetAmount: number;
    deadline?: string;
  }) {
    const goal = await prisma.goal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });

    return goal;
  },

  async list(userId: string, isCompleted?: string) {
    const where: any = { userId };

    if (isCompleted !== undefined) {
      where.isCompleted = isCompleted === 'true';
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        deposits: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return goals;
  },

  async getById(userId: string, id: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
      include: {
        deposits: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
    const progressPercent = goal.targetAmount > 0
      ? Math.round((goal.savedAmount / goal.targetAmount) * 10000) / 100
      : 0;

    return {
      ...goal,
      remaining: Math.round(remaining * 100) / 100,
      progressPercent,
    };
  },

  async update(userId: string, id: string, data: {
    name?: string;
    targetAmount?: number;
    savedAmount?: number;
    deadline?: string;
  }) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.targetAmount !== undefined) updateData.targetAmount = data.targetAmount;
    if (data.savedAmount !== undefined) updateData.savedAmount = data.savedAmount;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;

    // Auto-complete if savedAmount reaches targetAmount
    if (data.savedAmount !== undefined && data.savedAmount >= goal.targetAmount) {
      updateData.isCompleted = true;
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return updated;
  },

  async remove(userId: string, id: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    await prisma.goal.delete({ where: { id } });
    return { message: 'Goal deleted' };
  },

  async addDeposit(userId: string, goalId: string, amount: number) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const newSavedAmount = goal.savedAmount + amount;

    const deposit = await prisma.goalDeposit.create({
      data: {
        goalId,
        amount,
      },
    });

    // Update goal savedAmount
    const updateData: any = { savedAmount: newSavedAmount };
    if (newSavedAmount >= goal.targetAmount) {
      updateData.isCompleted = true;
    }

    await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });

    return deposit;
  },

  async listDeposits(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const deposits = await prisma.goalDeposit.findMany({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
    });

    return deposits;
  },

  async projection(userId: string, id: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const month = getCurrentMonth();

    const incomes = await prisma.income.findMany({
      where: { userId, month },
    });
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    const expenses = await prisma.expense.findMany({
      where: { userId, month },
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const disposableIncome = totalIncome - totalExpenses;
    const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);

    if (disposableIncome <= 0) {
      return {
        goalId: goal.id,
        goalName: goal.name,
        remaining: Math.round(remaining * 100) / 100,
        monthsRemaining: 0,
        monthlyContribution: Math.round(disposableIncome * 100) / 100,
        estimatedDate: null,
        message: 'No disposable income available -- cannot project completion',
      };
    }

    const monthsToGoal = Math.ceil(remaining / disposableIncome);
    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + monthsToGoal);

    return {
      goalId: goal.id,
      goalName: goal.name,
      remaining: Math.round(remaining * 100) / 100,
      monthsRemaining: monthsToGoal,
      monthlyContribution: Math.round(disposableIncome * 100) / 100,
      estimatedDate: estimatedDate.toISOString(),
    };
  },
};
