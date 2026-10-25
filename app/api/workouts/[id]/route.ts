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

  const template = await prisma.workoutTemplate.findFirst({
    where: { id, userId: session.user.id },
    include: {
      exercises: { include: { exercise: true }, orderBy: { order: 'asc' } },
    },
  })
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
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
