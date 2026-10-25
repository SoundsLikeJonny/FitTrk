export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const limit = parseInt(new URL(request.url).searchParams.get('limit') ?? '30', 10)
  const logs = await prisma.weightLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: limit,
  })
  return NextResponse.json(logs)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { date, weightLb } = body ?? {}
  const d = new Date((date ?? new Date().toISOString().slice(0, 10)) + 'T00:00:00.000Z')
  const log = await prisma.weightLog.upsert({
    where: { userId_date: { userId: session.user.id, date: d } },
    update: { weightLb },
    create: { userId: session.user.id, date: d, weightLb },
  })
  return NextResponse.json(log)
}
