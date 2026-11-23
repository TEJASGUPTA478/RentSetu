import { prisma } from '../../config/prisma.js'

/** Return only active manager accounts for landlord property assignment. */
export async function listManagers() {
  return prisma.user.findMany({
    where: { role: 'MANAGER', isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })
}
