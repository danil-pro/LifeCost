import { env } from './config/env';
import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureDatabase() {
  try {
    // Push schema if tables don't exist yet (for fresh Render instances)
    await prisma.$queryRaw`SELECT 1`;
    console.log('[LifeCost] Database connected');
  } catch {
    console.log('[LifeCost] Initializing database...');
    // DB will be initialized via prisma db push in build script
  }
}

async function seedDefaults() {
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
}

async function start() {
  await ensureDatabase();
  await seedDefaults();

  app.listen(env.PORT, () => {
    console.log(`[LifeCost] Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

start().catch((err) => {
  console.error('[LifeCost] Failed to start:', err);
  process.exit(1);
});
