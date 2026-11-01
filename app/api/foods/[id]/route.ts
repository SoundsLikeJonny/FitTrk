export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { findDuplicateFoods } from '@/lib/food-utils'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  if (body.name && !body.force) {
    const dupes = await findDuplicateFoods(body.name, session.user.id, id)
    if (dupes.length > 0) {
      return NextResponse.json(
        { error: 'duplicate', message: 'Another food with this name already exists', foods: dupes },
        { status: 409 },
      )
    }
  }
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
  try {
    await prisma.food.delete({ where: { id } })
  } catch (e: any) {
    if (e?.code === 'P2003') {
      return NextResponse.json({ error: 'This food is used in diary entries and cannot be deleted' }, { status: 400 })
    }
    throw e
  }
  return NextResponse.json({ success: true })
}
