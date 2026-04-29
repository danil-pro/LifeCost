import { PrismaClient } from '@prisma/client';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { hashPassword, comparePassword } from '../../utils/password';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Rent', nameRu: 'Аренда', icon: 'home', type: 'fixed', isDefault: true },
  { name: 'Food', nameRu: 'Еда', icon: 'utensils', type: 'variable', isDefault: true },
  { name: 'Transport', nameRu: 'Транспорт', icon: 'car', type: 'variable', isDefault: true },
  { name: 'Utilities', nameRu: 'Коммунальные', icon: 'zap', type: 'fixed', isDefault: true },
  { name: 'Entertainment', nameRu: 'Развлечения', icon: 'film', type: 'variable', isDefault: true },
  { name: 'Healthcare', nameRu: 'Здоровье', icon: 'heart', type: 'variable', isDefault: true },
  { name: 'Education', nameRu: 'Образование', icon: 'book', type: 'variable', isDefault: true },
  { name: 'Shopping', nameRu: 'Покупки', icon: 'shopping-bag', type: 'variable', isDefault: true },
  { name: 'Coffee', nameRu: 'Кофе', icon: 'coffee', type: 'variable', isDefault: true },
  { name: 'Subscriptions', nameRu: 'Подписки', icon: 'repeat', type: 'fixed', isDefault: true },
  { name: 'Quick Expenses', nameRu: 'Быстрые траты', icon: 'flash', type: 'variable', isDefault: true },
];

export const authService = {
  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        categories: {
          create: DEFAULT_CATEGORIES,
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        locale: true,
        currency: true,
        tier: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accessToken = signAccessToken({ userId: user.id, tier: user.tier });
    const refreshToken = signRefreshToken({ userId: user.id, tier: user.tier });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken, user };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = signAccessToken({ userId: user.id, tier: user.tier });
    const refreshToken = signRefreshToken({ userId: user.id, tier: user.tier });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { accessToken, refreshToken, user: userWithoutPassword };
  },

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token } });
      throw new Error('Refresh token expired');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = signAccessToken({ userId: user.id, tier: user.tier });

    return { accessToken };
  },

  async logout(userId: string, token: string) {
    await prisma.refreshToken.deleteMany({
      where: { userId, token },
    });
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        locale: true,
        currency: true,
        tier: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },
};
