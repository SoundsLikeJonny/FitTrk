export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = new URL(request.url).searchParams.get('q') ?? ''
  const foods = await prisma.food.findMany({
    where: {
      OR: [
        { userId: null, isCustom: false },
        { userId: session.user.id },
      ],
      ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
    },
    orderBy: { name: 'asc' },
    take: 100,
  })
  return NextResponse.json(foods)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { name, amountG, cal, fatG, carbG, proteinG, typicalG, presets } = body ?? {}
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const food = await prisma.food.create({
    data: {
      name, amountG: amountG ?? 100, cal: cal ?? 0, fatG: fatG ?? 0,
      carbG: carbG ?? 0, proteinG: proteinG ?? 0, typicalG: typicalG ?? 100,
      isCustom: true, userId: session.user.id,
      presets: presets ? JSON.stringify(presets) : '[0.5, 1, 2]',
    },
  })
  return NextResponse.json(food)
}
