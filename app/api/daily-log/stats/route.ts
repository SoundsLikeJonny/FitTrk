export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { calcEntryNutrition } from '@/lib/nutrition'

function shiftDate(dateStr: string, offsetDays: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const todayStr = new URL(request.url).searchParams.get('date') ?? new Date().toISOString().slice(0, 10)
  const startStr = shiftDate(todayStr, -29)

  const startDate = new Date(startStr + 'T00:00:00.000Z')
  const endDate = new Date(todayStr + 'T00:00:00.000Z')

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate, lte: endDate },
    },
    include: { entries: { include: { food: true } } },
  })

  const dayMap = new Map<string, { date: string; cal: number; proteinG: number; fatG: number; carbG: number }>()

  for (let i = 0; i <= 29; i++) {
    const ds = shiftDate(todayStr, -29 + i)
    dayMap.set(ds, { date: ds, cal: 0, proteinG: 0, fatG: 0, carbG: 0 })
  }

  for (const log of logs) {
    const ds = log.date.toISOString().slice(0, 10)
    const day = dayMap.get(ds)
    if (!day) continue
    for (const entry of log.entries) {
      const n = calcEntryNutrition({
        multiplier: entry.multiplier,
        amountG: entry.amountG,
        food: entry.food,
      })
      day.cal += n.cal
      day.proteinG += n.proteinG
      day.fatG += n.fatG
      day.carbG += n.carbG
    }
  }

  return NextResponse.json(Array.from(dayMap.values()))
}
