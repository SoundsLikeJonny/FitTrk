export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dateStr = new URL(request.url).searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
  const date = new Date(dateStr + 'T00:00:00.000Z')
  let log = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId: session.user.id, date } },
    include: { entries: { include: { food: true }, orderBy: { order: 'asc' } } },
  })
  if (!log) {
    log = await prisma.dailyLog.create({
      data: { userId: session.user.id, date },
      include: { entries: { include: { food: true }, orderBy: { order: 'asc' } } },
    })
  }
  return NextResponse.json(log)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { date, foodId, multiplier, amountG } = body ?? {}
  const d = new Date((date ?? new Date().toISOString().slice(0, 10)) + 'T00:00:00.000Z')
  let log = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId: session.user.id, date: d } },
  })
  if (!log) {
    log = await prisma.dailyLog.create({ data: { userId: session.user.id, date: d } })
  }
  const count = await prisma.foodEntry.count({ where: { dailyLogId: log.id } })
  const entry = await prisma.foodEntry.create({
    data: {
      dailyLogId: log.id, foodId, multiplier: multiplier ?? 1,
      amountG: amountG ?? null, order: count,
    },
    include: { food: true },
  })
  return NextResponse.json(entry)
}
