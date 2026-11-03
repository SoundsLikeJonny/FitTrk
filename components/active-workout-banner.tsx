'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, ChevronRight } from 'lucide-react'

export function ActiveWorkoutBanner() {
  const [session, setSession] = useState<any>(null)
  const [elapsed, setElapsed] = useState(0)
  const router = useRouter()

  const fetchActive = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions?active=true')
      if (res.ok) setSession(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    fetchActive()
    const i = setInterval(fetchActive, 10000)
    return () => clearInterval(i)
  }, [fetchActive])

  useEffect(() => {
    if (!session?.startedAt) return
    const update = () => setElapsed(Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000))
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [session?.startedAt])

  if (!session) return null

  const setLogs = session?.setLogs ?? []
  const currentSet = setLogs.find((s: any) => !s?.completed)
  const completedCount = setLogs.filter((s: any) => s?.completed).length
  const totalCount = setLogs.length

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  let setInfo: string
  if (currentSet) {
    const exName = currentSet?.exercise?.name ?? 'Exercise'
    const weight = currentSet?.weight ?? 0
    const reps = currentSet?.reps ?? 0
    setInfo = `${exName} · Set ${currentSet?.setNumber ?? 1} · ${weight}lb × ${reps}`
  } else if (totalCount > 0) {
    setInfo = 'All sets complete — finish workout'
  } else {
    setInfo = 'Tap to start logging sets'
  }

  return (
    <button
      onClick={() => router.push(`/session/${session.id}`)}
      className="w-full bg-green-600 text-white px-4 py-2.5 flex items-center gap-3 hover:bg-green-700 transition-colors text-left"
    >
      <Dumbbell className="w-4 h-4 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{session?.name ?? 'Active Workout'}</span>
          <span className="text-xs font-mono opacity-80 shrink-0">{formatTime(elapsed)}</span>
          {totalCount > 0 && (
            <span className="text-xs opacity-80 shrink-0">{completedCount}/{totalCount}</span>
          )}
        </div>
        <p className="text-xs opacity-90 truncate">{setInfo}</p>
      </div>
      <ChevronRight className="w-4 h-4 shrink-0 opacity-80" />
    </button>
  )
}
