export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let settings = await prisma.userSettings.findUnique({ where: { userId: session.user.id } })
  if (!settings) {
    settings = await prisma.userSettings.create({ data: { userId: session.user.id } })
  }
  return NextResponse.json(settings)
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      weightLb: body.weightLb ?? undefined, mode: body.mode ?? undefined,
      cutDeficit: body.cutDeficit ?? undefined, bulkSurplus: body.bulkSurplus ?? undefined,
      calMultiplier: body.calMultiplier ?? undefined, proteinMultiplier: body.proteinMultiplier ?? undefined,
      proteinMinMultiplier: body.proteinMinMultiplier ?? undefined,
      fatMinMultiplier: body.fatMinMultiplier ?? undefined,
      weightUnit: body.weightUnit ?? undefined, restTimerDefault: body.restTimerDefault ?? undefined,
    },
    create: { userId: session.user.id, ...body },
  })
  return NextResponse.json(settings)
}
