import { prisma } from '@/lib/db'

export async function findDuplicateFoods(name: string, userId: string, excludeId?: string) {
  const normalized = name?.trim().toLowerCase()
  if (!normalized) return []
  return prisma.food.findMany({
    where: {
      AND: [
        { name: { equals: normalized, mode: 'insensitive' as const } },
        { OR: [{ userId: null, isCustom: false }, { userId }] },
        ...(excludeId ? [{ id: { not: excludeId } }] : []),
      ],
    },
    orderBy: { name: 'asc' },
    take: 10,
  })
}
