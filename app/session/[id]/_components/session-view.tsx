'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Plus, Timer, Square, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SessionView({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<any>(null)
  const [elapsed, setElapsed] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const [restDuration, setRestDuration] = useState(90)
  const startRef = useRef(Date.now())
  const router = useRouter()

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`)
    if (res.ok) setSession(await res.json())
  }, [sessionId])

  useEffect(() => { fetchSession() }, [fetchSession])
  useEffect(() => {
    const i = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(i)
  }, [])
  useEffect(() => {
    if (!restActive) return
    const i = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) {
          setRestActive(false)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Rest timer done!', { body: 'Time for your next set' })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(i)
  }, [restActive])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const toggleSet = async (setLog: any) => {
    const newCompleted = !setLog.completed
    await fetch(`/api/sessions/${sessionId}/sets`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setId: setLog.id, completed: newCompleted, weight: setLog.weight, reps: setLog.reps }),
    })
    if (newCompleted) {
      setRestTimer(restDuration)
      setRestActive(true)
    }
    fetchSession()
  }

  const updateSet = async (setLog: any, field: string, value: number) => {
    await fetch(`/api/sessions/${sessionId}/sets`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setId: setLog.id, [field]: value }),
    })
    fetchSession()
  }

  const addSet = async (exerciseId: string) => {
    const exSets = (session?.setLogs ?? []).filter((s: any) => s?.exerciseId === exerciseId)
    const lastSet = exSets[exSets.length - 1]
    await fetch(`/api/sessions/${sessionId}/sets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId, setNumber: (lastSet?.setNumber ?? 0) + 1, weight: lastSet?.weight ?? 0, reps: lastSet?.reps ?? 10 }),
    })
    fetchSession()
  }

  const finishWorkout = async () => {
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finishedAt: new Date().toISOString(), durationSec: elapsed }),
    })
    router.push('/history')
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (!session) return <div className="p-4"><p className="text-muted-foreground">Loading...</p></div>

  const exerciseGroups = (session?.setLogs ?? []).reduce((acc: any, log: any) => {
    const eid = log?.exerciseId ?? 'unknown'
    if (!acc[eid]) acc[eid] = { name: log?.exercise?.name ?? 'Exercise', id: eid, restSeconds: log?.exercise?.restSeconds ?? 90, sets: [] }
    acc[eid].sets.push(log)
    return acc
  }, {} as Record<string, any>)

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-accent"><ChevronLeft className="w-5 h-5" /></button>
        <div className="text-center">
          <p className="font-display font-bold">{session?.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{formatTime(elapsed)}</p>
        </div>
        <div className="w-9" />
      </div>

      {restActive && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4 text-center">
          <Timer className="w-6 h-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-mono font-bold text-primary">{formatTime(restTimer)}</p>
          <p className="text-xs text-muted-foreground">Rest Timer</p>
          <button onClick={() => setRestActive(false)} className="mt-2 text-xs text-primary hover:underline">Skip</button>
        </div>
      )}

      {Object.values(exerciseGroups).map((g: any) => (
        <div key={g.id} className="bg-card rounded-xl p-4 mb-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="font-medium mb-3">{g?.name}</p>
          <div className="space-y-2">
            {(g?.sets ?? []).map((set: any) => (
              <div key={set.id} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-6">{set?.setNumber}</span>
                <input type="number" value={set?.weight ?? 0} onChange={e => updateSet(set, 'weight', parseFloat(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-ring" />
                <span className="text-xs text-muted-foreground">lb ×</span>
                <input type="number" value={set?.reps ?? 0} onChange={e => updateSet(set, 'reps', parseInt(e.target.value) || 0)}
                  className="w-16 rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-ring" />
                <button onClick={() => toggleSet(set)}
                  className={cn('p-2 rounded-lg transition-colors', set?.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent')}>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => addSet(g.id)} className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="w-3 h-3" /> Add Set</button>
        </div>
      ))}

      <button onClick={finishWorkout} className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium flex items-center justify-center gap-2 hover:bg-primary/90">
        <Square className="w-4 h-4" /> Finish Workout
      </button>
    </div>
  )
}
