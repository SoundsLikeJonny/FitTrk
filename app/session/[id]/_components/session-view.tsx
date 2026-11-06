'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Plus, Timer, Square, ChevronLeft, X, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const REST_PRESETS = [30, 60, 90, 120, 180]

export function SessionView({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<any>(null)
  const [elapsed, setElapsed] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const [selectedRestDuration, setSelectedRestDuration] = useState(90)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false)
  const [allExercises, setAllExercises] = useState<any[]>([])
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [templateChanged, setTemplateChanged] = useState(false)
  const router = useRouter()

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`)
    if (res.ok) setSession(await res.json())
  }, [sessionId])

  useEffect(() => { fetchSession() }, [fetchSession])
  useEffect(() => {
    if (!session?.startedAt) return
    const startedMs = new Date(session.startedAt).getTime()
    const update = () => setElapsed(Math.floor((Date.now() - startedMs) / 1000))
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [session?.startedAt])
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

  useEffect(() => {
    if (!showExercisePicker) return
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/exercises')
      if (res.ok && !cancelled) setAllExercises(await res.json())
    })()
    return () => { cancelled = true }
  }, [showExercisePicker])

  const startRest = (duration: number) => {
    setRestTimer(duration)
    setRestActive(true)
  }

  const toggleSet = async (setLog: any) => {
    const newCompleted = !setLog.completed
    await fetch(`/api/sessions/${sessionId}/sets`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setId: setLog.id, completed: newCompleted, weight: setLog.weight, reps: setLog.reps }),
    })
    if (newCompleted) {
      startRest(selectedRestDuration)
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

  const addExercise = async (exercise: any) => {
    await fetch(`/api/sessions/${sessionId}/sets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId: exercise.id, setNumber: 1, weight: 0, reps: exercise.defaultReps ?? 10 }),
    })
    setShowExercisePicker(false)
    setExerciseSearch('')
    fetchSession()
  }

  const removeExercise = async (exerciseId: string, name: string) => {
    if (!window.confirm(`Remove "${name}" and all its sets from this workout?`)) return
    await fetch(`/api/sessions/${sessionId}/sets?exerciseId=${exerciseId}`, { method: 'DELETE' })
    fetchSession()
  }

  const completeSession = async () => {
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finishedAt: new Date().toISOString(), durationSec: elapsed }),
    })
    router.push('/history')
  }

  const currentExerciseIds = () => Array.from(new Set(
    (session?.setLogs ?? []).map((s: any) => s?.exerciseId).filter(Boolean)
  )) as string[]

  const finishWorkout = async () => {
    const completedSets = (session?.setLogs ?? []).filter((s: any) => s?.completed)
    if (completedSets.length === 0) {
      toast.error('Cannot finish an empty workout. Complete at least one set first.')
      return
    }
    if (!session?.templateId) {
      await completeSession()
      return
    }
    const res = await fetch(`/api/workouts/${session.templateId}`)
    if (!res.ok) {
      await completeSession()
      return
    }
    const template = await res.json()
    const templateExerciseIds: string[] = (template?.exercises ?? []).map((ex: any) => ex?.exerciseId)
    const sessionExerciseIds = currentExerciseIds()
    const changed = templateExerciseIds.length !== sessionExerciseIds.length ||
      templateExerciseIds.some(id => !sessionExerciseIds.includes(id))
    if (!changed) {
      await completeSession()
      return
    }
    setTemplateChanged(true)
    setShowTemplatePrompt(true)
  }

  const updateTemplateAndFinish = async () => {
    if (session?.templateId) {
      await fetch(`/api/workouts/${session.templateId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercises: currentExerciseIds().map(id => ({ exerciseId: id, sets: 3, reps: 10, weight: 0 })) }),
      })
    }
    setShowTemplatePrompt(false)
    await completeSession()
  }

  const skipTemplateUpdate = async () => {
    setShowTemplatePrompt(false)
    await completeSession()
  }

  const cancelWorkout = async () => {
    await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
    router.push('/workouts')
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (!session) return <div className="p-4"><p className="text-muted-foreground">Loading...</p></div>

  const exerciseGroups = (session?.setLogs ?? []).reduce((acc: any, log: any) => {
    const eid = log?.exerciseId ?? 'unknown'
    if (!acc[eid]) acc[eid] = { name: log?.exercise?.name ?? 'Exercise', id: eid, restSeconds: log?.exercise?.restSeconds ?? 90, sets: [] }
    acc[eid].sets.push(log)
    return acc
  }, {} as Record<string, any>)

  const filteredExercises = (allExercises ?? []).filter((e: any) =>
    (e?.name ?? '').toLowerCase().includes(exerciseSearch.toLowerCase())
  )
  const exercisesByBodyPart = filteredExercises.reduce((acc: any, e: any) => {
    const bp = e?.bodyPart ?? 'other'
    if (!acc[bp]) acc[bp] = []
    acc[bp].push(e)
    return acc
  }, {} as Record<string, any[]>)

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

      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4 text-center">
        <Timer className="w-6 h-6 mx-auto text-primary mb-1" />
        {restActive ? (
          <>
            <p className="text-2xl font-mono font-bold text-primary">{formatTime(restTimer)}</p>
            <p className="text-xs text-muted-foreground">Rest Timer</p>
            <button onClick={() => setRestActive(false)} className="mt-2 text-xs text-primary hover:underline">Cancel</button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Rest Timer</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          {REST_PRESETS.map(d => (
            <button key={d} onClick={() => setSelectedRestDuration(d)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', selectedRestDuration === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent')}>
              {d}s
            </button>
          ))}
        </div>
        <button onClick={() => startRest(selectedRestDuration)} className="mt-3 mx-auto rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90">
          <Timer className="w-4 h-4" /> Start Timer
        </button>
      </div>

      {Object.values(exerciseGroups).map((g: any) => (
        <div key={g.id} className="bg-card rounded-xl p-4 mb-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium">{g?.name}</p>
            <button onClick={() => removeExercise(g.id, g?.name)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
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

      <button onClick={() => setShowExercisePicker(true)} className="w-full mb-3 rounded-xl border border-dashed border-border text-primary py-3 font-medium flex items-center justify-center gap-2 hover:bg-accent">
        <Plus className="w-4 h-4" /> Add Exercise
      </button>

      <div className="flex gap-2">
        <button onClick={() => setShowCancelConfirm(true)} className="rounded-xl border border-destructive/30 text-destructive py-3 px-4 font-medium flex items-center justify-center gap-2 hover:bg-destructive/10">
          <X className="w-4 h-4" /> Cancel
        </button>
        <button onClick={finishWorkout} className="flex-1 rounded-xl bg-primary text-primary-foreground py-3 font-medium flex items-center justify-center gap-2 hover:bg-primary/90">
          <Square className="w-4 h-4" /> Finish Workout
        </button>
      </div>

      {showExercisePicker && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => { setShowExercisePicker(false); setExerciseSearch('') }}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input autoFocus type="text" placeholder="Search exercises..." value={exerciseSearch} onChange={e => setExerciseSearch(e.target.value)} className="flex-1 bg-transparent text-sm focus:outline-none" />
              <button onClick={() => { setShowExercisePicker(false); setExerciseSearch('') }}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-2 pb-8" style={{ WebkitOverflowScrolling: 'touch' }}>
              {Object.entries(exercisesByBodyPart).map(([bodyPart, exs]) => (
                <div key={bodyPart} className="mb-2">
                  <p className="px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground capitalize">{bodyPart}</p>
                  {(exs as any[]).map((e: any) => (
                    <div key={e.id} className="p-3 hover:bg-accent active:bg-accent rounded-xl cursor-pointer" onClick={() => addExercise(e)}>
                      <p className="font-medium text-sm">{e.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{e.bodyPart} · {e.defaultSets}×{e.defaultReps}</p>
                    </div>
                  ))}
                </div>
              ))}
              {filteredExercises.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No exercises found</p>}
            </div>
          </div>
        </div>
      )}

      {showTemplatePrompt && templateChanged && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={skipTemplateUpdate}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
            <h3 className="font-display font-bold text-lg mb-2">Update Template?</h3>
            <p className="text-sm text-muted-foreground mb-6">You&apos;ve changed the exercises in this workout. Update the template to match?</p>
            <div className="flex gap-2">
              <button onClick={skipTemplateUpdate} className="flex-1 rounded-xl border border-border py-3 font-medium hover:bg-accent">Skip</button>
              <button onClick={updateTemplateAndFinish} className="flex-1 rounded-xl bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90">Update Template</button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setShowCancelConfirm(false)}>
          <div className="bg-card w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
            <h3 className="font-display font-bold text-lg mb-2">Cancel Workout?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will permanently delete the workout session and all logged sets. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowCancelConfirm(false)} className="flex-1 rounded-xl border border-border py-3 font-medium hover:bg-accent">Keep Workout</button>
              <button onClick={cancelWorkout} className="flex-1 rounded-xl bg-destructive text-destructive-foreground py-3 font-medium hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
