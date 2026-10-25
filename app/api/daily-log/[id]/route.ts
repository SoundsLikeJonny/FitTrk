export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const entry = await prisma.foodEntry.update({
    where: { id },
    data: {
      multiplier: body.multiplier ?? undefined,
      amountG: body.amountG !== undefined ? body.amountG : undefined,
    },
    include: { food: true },
  })
  return NextResponse.json(entry)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.foodEntry.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
