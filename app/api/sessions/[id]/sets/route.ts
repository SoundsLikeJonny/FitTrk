export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await request.json()
  const { exerciseId, setNumber, weight, reps } = body ?? {}

  const setLog = await prisma.setLog.create({
    data: {
      sessionId: id,
      exerciseId,
      setNumber: setNumber ?? 1,
      weight: weight ?? 0,
      reps: reps ?? 0,
      completed: false,
    },
    include: { exercise: true },
  })
  return NextResponse.json(setLog)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { setId, weight, reps, completed, rpe } = body ?? {}

  if (!setId) return NextResponse.json({ error: 'setId required' }, { status: 400 })

  const updated = await prisma.setLog.update({
    where: { id: setId },
    data: {
      weight: weight !== undefined ? weight : undefined,
      reps: reps !== undefined ? reps : undefined,
      completed: completed !== undefined ? completed : undefined,
      rpe: rpe !== undefined ? rpe : undefined,
    },
    include: { exercise: true },
  })
  return NextResponse.json(updated)
}
