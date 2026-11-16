import { PrismaClient } from '@prisma/client'

const prismaGlobal = globalThis

/** Reuse one Prisma Client across hot reloads in development. */
export const prisma = prismaGlobal.__rentsetuPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') prismaGlobal.__rentsetuPrisma = prisma
