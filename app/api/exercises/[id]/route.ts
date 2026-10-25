export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      name: body.name ?? undefined, bodyPart: body.bodyPart ?? undefined,
      category: body.category ?? undefined, weightType: body.weightType ?? undefined,
      restSeconds: body.restSeconds ?? undefined,
    },
  })
  return NextResponse.json(exercise)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.exercise.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
