import { PrismaClient } from "@prisma/client";

// Предотвращаем создание множества экземпляров Prisma Client в development режиме
// из-за hot-reload в Next.js

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
