import { env } from './config/env';
import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDefaults() {
  try {
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      console.log('[LifeCost] Seeding default categories...');
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

      for (const cat of defaultCategories) {
        await prisma.category.upsert({
          where: { userId_name: { userId: '', name: cat.name } },
          update: {},
          create: { ...cat, userId: null },
        });
      }
      console.log('[LifeCost] Default categories seeded');
    }
  } catch (err) {
    console.error('[LifeCost] Seed error (tables may not exist yet):', err);
  }
}

async function start() {
  await seedDefaults();

  app.listen(env.PORT, () => {
    console.log(`[LifeCost] Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

start().catch((err) => {
  console.error('[LifeCost] Failed to start:', err);
  process.exit(1);
});
