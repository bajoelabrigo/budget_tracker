import { PrismaClient } from "@/lib/generated/prisma"; // 👈 coincide con tu "output" del schema

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// No pases opciones al constructor; usará env("DATABASE_URL") del schema
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // opcional: log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
