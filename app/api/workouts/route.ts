export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await prisma.workoutTemplate.findMany({
    where: { userId: session.user.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(templates)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, exercises } = body ?? {}

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const template = await prisma.workoutTemplate.create({
    data: {
      name,
      userId: session.user.id,
      exercises: {
        create: (exercises ?? []).map((ex: any, i: number) => ({
          exerciseId: ex.exerciseId,
          order: i,
          sets: ex.sets ?? 3,
          reps: ex.reps ?? 10,
          weight: ex.weight ?? 0,
        })),
      },
    },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
    },
  })
  return NextResponse.json(template)
}
