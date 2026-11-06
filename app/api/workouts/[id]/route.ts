export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const template = await prisma.workoutTemplate.findFirst({
    where: { id, userId: session.user.id },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
    },
  })
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Optional: attach last 5 historical sessions per exercise for the detail view.
  const url = new URL(request.url)
  if (url.searchParams.get('history') === 'true') {
    const exercisesWithHistory = await Promise.all(
      template.exercises.map(async (te) => {
        const logs = await prisma.setLog.findMany({
          where: { exerciseId: te.exerciseId, session: { userId: session.user.id, finishedAt: { not: null } } },
          include: { session: { select: { id: true, startedAt: true, name: true, durationSec: true } } },
          orderBy: { session: { startedAt: 'desc' } },
          take: 60,
        })
        // Group set logs into sessions (preserve session order = most recent first).
        const bySession = new Map<string, { session: any; sets: any[] }>()
        for (const log of logs) {
          const sid = log.session.id
          if (!bySession.has(sid)) bySession.set(sid, { session: log.session, sets: [] })
          bySession.get(sid)!.sets.push({ setNumber: log.setNumber, weight: log.weight, reps: log.reps, completed: log.completed })
        }
        const history = Array.from(bySession.values())
          .slice(0, 5)
          .map(({ session: s, sets }) => ({
            sessionId: s.id,
            name: s.name,
            date: s.startedAt,
            durationSec: s.durationSec,
            sets: sets.sort((a, b) => a.setNumber - b.setNumber),
          }))
        return { ...te, history }
      })
    )
    return NextResponse.json({ ...template, exercises: exercisesWithHistory })
  }

  return NextResponse.json(template)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await request.json()
  const { name, exercises } = body ?? {}

  // Delete existing exercises and recreate
  await prisma.templateExercise.deleteMany({ where: { templateId: id } })

  const template = await prisma.workoutTemplate.update({
    where: { id },
    data: {
      name: name ?? undefined,
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  await prisma.workoutTemplate.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
