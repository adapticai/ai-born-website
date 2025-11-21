/**
 * Prisma Client Singleton
 *
 * This file ensures we only instantiate Prisma Client once across the application.
 * This is important in development where hot-reloading can create multiple instances.
 *
 * Usage:
 * import { prisma } from '@/lib/prisma';
 *
 * const users = await prisma.user.findMany();
 */

import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit during hot reloads.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export Prisma types for convenience
export * from '@prisma/client';
