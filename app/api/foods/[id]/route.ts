export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const food = await prisma.food.update({
    where: { id },
    data: {
      name: body.name ?? undefined, amountG: body.amountG ?? undefined,
      cal: body.cal ?? undefined, fatG: body.fatG ?? undefined,
      carbG: body.carbG ?? undefined, proteinG: body.proteinG ?? undefined,
      typicalG: body.typicalG ?? undefined,
      presets: body.presets ? JSON.stringify(body.presets) : undefined,
    },
  })
  return NextResponse.json(food)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.food.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
