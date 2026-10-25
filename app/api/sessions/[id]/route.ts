export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const ws = await prisma.workoutSession.findFirst({
    where: { id, userId: session.user.id },
    include: {
      setLogs: { include: { exercise: true }, orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }] },
    },
  })
  if (!ws) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ws)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await request.json()
  const { finishedAt, durationSec, notes, sets } = body ?? {}

  // Update sets if provided
  if (sets && Array.isArray(sets)) {
    for (const s of sets) {
      if (s.id) {
        await prisma.setLog.update({
          where: { id: s.id },
          data: {
            weight: s.weight ?? undefined,
            reps: s.reps ?? undefined,
            completed: s.completed ?? undefined,
            rpe: s.rpe ?? undefined,
          },
        })
      }
    }
  }

  const updated = await prisma.workoutSession.update({
    where: { id },
    data: {
      finishedAt: finishedAt ? new Date(finishedAt) : undefined,
      durationSec: durationSec ?? undefined,
      notes: notes ?? undefined,
    },
    include: {
      setLogs: { include: { exercise: true }, orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }] },
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  await prisma.workoutSession.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
