export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') ?? '50', 10)
  const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: session.user.id, finishedAt: { not: null } },
    include: {
      setLogs: { include: { exercise: true }, orderBy: { setNumber: 'asc' } },
      template: true,
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
    skip: offset,
  })
  return NextResponse.json(sessions)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { templateId, name } = body ?? {}

  let workoutName = name ?? 'Workout'
  let setLogsData: any[] = []

  if (templateId) {
    const template = await prisma.workoutTemplate.findFirst({
      where: { id: templateId, userId: session.user.id },
      include: { exercises: { include: { exercise: true }, orderBy: { order: 'asc' } } },
    })
    if (template) {
      workoutName = template.name
      // Get previous performance for each exercise
      for (const te of template.exercises ?? []) {
        for (let s = 1; s <= te.sets; s++) {
          // Find previous best for this exercise
          const prevLog = await prisma.setLog.findFirst({
            where: {
              exerciseId: te.exerciseId,
              completed: true,
              session: { userId: session.user.id, finishedAt: { not: null } },
            },
            orderBy: { session: { startedAt: 'desc' } },
          })
          setLogsData.push({
            exerciseId: te.exerciseId,
            setNumber: s,
            weight: prevLog?.weight ?? te.weight,
            reps: prevLog?.reps ?? te.reps,
            completed: false,
          })
        }
      }
    }
  }

  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId: session.user.id,
      templateId: templateId ?? null,
      name: workoutName,
      setLogs: {
        create: setLogsData,
      },
    },
    include: {
      setLogs: { include: { exercise: true }, orderBy: { setNumber: 'asc' } },
    },
  })
  return NextResponse.json(workoutSession)
}
