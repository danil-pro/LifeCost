import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../../utils/password';

const prisma = new PrismaClient();

export const usersService = {
  async getProfile(userId: string) {
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

  async updateProfile(userId: string, data: { displayName?: string; locale?: string; currency?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
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

    return user;
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = comparePassword(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const passwordHash = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully' };
  },

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
    return { message: 'Account deleted successfully' };
  },
};
