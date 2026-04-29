import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Rent', nameRu: 'Аренда', icon: '🏠', type: 'fixed', isDefault: true },
  { name: 'Food', nameRu: 'Еда', icon: '🍕', type: 'fixed', isDefault: true },
  { name: 'Transport', nameRu: 'Транспорт', icon: '🚗', type: 'fixed', isDefault: true },
  { name: 'Insurance', nameRu: 'Страховка', icon: '🛡️', type: 'fixed', isDefault: true },
  { name: 'Taxes', nameRu: 'Налоги', icon: '📋', type: 'fixed', isDefault: true },
  { name: 'Subscriptions', nameRu: 'Подписки', icon: '📺', type: 'fixed', isDefault: true },
  { name: 'Coffee', nameRu: 'Кофе', icon: '☕', type: 'variable', isDefault: true },
  { name: 'Snacks', nameRu: 'Снеки', icon: '🍫', type: 'variable', isDefault: true },
  { name: 'Fast Food', nameRu: 'Фастфуд', icon: '🍔', type: 'variable', isDefault: true },
  { name: 'Entertainment', nameRu: 'Развлечения', icon: '🎮', type: 'variable', isDefault: true },
  { name: 'Shopping', nameRu: 'Покупки', icon: '🛍️', type: 'variable', isDefault: true },
  { name: 'Quick Expenses', nameRu: 'Быстрые траты', icon: '⚡', type: 'variable', isDefault: true },
  { name: 'Other', nameRu: 'Другое', icon: '📦', type: 'variable', isDefault: true },
];

async function main() {
  console.log('Seeding default categories...');
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: '', name: cat.name } },
      update: {},
      create: { ...cat, userId: null },
    });
  }
  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
