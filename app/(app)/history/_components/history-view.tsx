'use client'
import { useState, useEffect } from 'react'
import { History, Clock, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react'

export function HistoryView() {
  const [sessions, setSessions] = useState<any[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sessions?limit=50').then(async r => { if (r.ok) setSessions(await r.json()); setLoading(false) })
  }, [])

  const formatDur = (s: number | null) => {
    if (!s) return '--'
    const m = Math.floor(s / 60)
    return `${m}m`
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h1 className="font-display font-bold text-xl mb-4">History</h1>
      {(sessions ?? []).map((s: any) => {
        const isOpen = expanded === s.id
        const exerciseGroups = (s?.setLogs ?? []).reduce((acc: any, log: any) => {
          const eid = log?.exerciseId ?? 'unknown'
          if (!acc[eid]) acc[eid] = { name: log?.exercise?.name ?? 'Exercise', sets: [] }
          acc[eid].sets.push(log)
          return acc
        }, {} as Record<string, any>)

        return (
          <div key={s.id} className="bg-card rounded-xl mb-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <button onClick={() => setExpanded(isOpen ? null : s.id)} className="w-full p-4 flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium">{s?.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{new Date(s?.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <Clock className="w-3 h-3" /><span>{formatDur(s?.durationSec)}</span>
                  <Dumbbell className="w-3 h-3" /><span>{Object.keys(exerciseGroups).length} exercises</span>
                </p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-3">
                {Object.values(exerciseGroups).map((g: any, i: number) => (
                  <div key={i}>
                    <p className="text-sm font-medium mb-1">{g?.name}</p>
                    <div className="space-y-0.5">
                      {(g?.sets ?? []).map((set: any, j: number) => (
                        <p key={j} className="text-xs text-muted-foreground">
                          Set {set?.setNumber}: {set?.weight ?? 0} lb × {set?.reps ?? 0} {set?.completed ? '✓' : ''}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
      {!loading && sessions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground"><History className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No completed workouts yet</p></div>
      )}
    </div>
  )
}
