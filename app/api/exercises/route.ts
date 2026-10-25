export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [
        { userId: null, isCustom: false },
        { userId: session.user.id },
      ],
    },
    orderBy: [{ bodyPart: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(exercises)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, bodyPart, category, weightType, restSeconds } = body ?? {}

  if (!name || !bodyPart || !category) {
    return NextResponse.json({ error: 'Name, bodyPart, and category are required' }, { status: 400 })
  }

  const exercise = await prisma.exercise.create({
    data: {
      name,
      bodyPart,
      category: category ?? 'compound',
      weightType: weightType ?? 'barbell',
      restSeconds: restSeconds ?? 90,
      isCustom: true,
      userId: session.user.id,
    },
  })
  return NextResponse.json(exercise)
}
