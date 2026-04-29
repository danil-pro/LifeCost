import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const categoriesService = {
  async list(userId: string) {
    // Get user-specific categories first
    const userCategories = await prisma.category.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    // If user has categories (created during registration), return only those
    if (userCategories.length > 0) {
      return userCategories;
    }

    // Fallback: return system defaults (userId: null)
    return prisma.category.findMany({
      where: { userId: null },
      orderBy: [{ name: 'asc' }],
    });
  },

  async create(userId: string, data: {
    name: string;
    nameRu?: string;
    icon?: string;
    type?: string;
  }) {
    const category = await prisma.category.create({
      data: {
        userId,
        name: data.name,
        nameRu: data.nameRu,
        icon: data.icon,
        type: data.type || 'variable',
      },
    });

    return category;
  },

  async update(userId: string, id: string, data: {
    name?: string;
    nameRu?: string;
    icon?: string;
    type?: string;
  }) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new Error('Category not found or not owned by user');
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    return updated;
  },

  async remove(userId: string, id: string) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new Error('Category not found or not owned by user');
    }

    const linkedExpenses = await prisma.expense.count({
      where: { categoryId: id },
    });

    if (linkedExpenses > 0) {
      throw new Error(`Cannot delete category: ${linkedExpenses} expense(s) linked to it`);
    }

    await prisma.category.delete({ where: { id } });
    return { message: 'Category deleted' };
  },
};
