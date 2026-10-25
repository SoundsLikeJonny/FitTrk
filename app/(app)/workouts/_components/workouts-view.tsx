'use client'
import { useState, useEffect } from 'react'
import { Plus, Play, Trash2, Dumbbell } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function WorkoutsView() {
  const [templates, setTemplates] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<any[]>([])
  const [allExercises, setAllExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    Promise.all([fetch('/api/workouts'), fetch('/api/exercises')]).then(async ([t, e]) => {
      if (t.ok) setTemplates(await t.json())
      if (e.ok) setAllExercises(await e.json())
      setLoading(false)
    })
  }, [])

  const startWorkout = async (templateId: string) => {
    const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId }) })
    if (res.ok) { const s = await res.json(); router.push(`/session/${s.id}`) }
  }

  const createTemplate = async () => {
    if (!name) return
    const res = await fetch('/api/workouts', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, exercises: selectedExercises.map((e: any) => ({ exerciseId: e.id, sets: 3, reps: 10, weight: 0 })) }) })
    if (res.ok) { const t = await res.json(); setTemplates(prev => [t, ...prev]); setShowCreate(false); setName(''); setSelectedExercises([]) }
  }

  const deleteTemplate = async (id: string) => {
    await fetch(`/api/workouts/${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const grouped = (allExercises ?? []).reduce((acc: any, ex: any) => {
    const bp = ex?.bodyPart ?? 'other'
    if (!acc[bp]) acc[bp] = []
    acc[bp].push(ex)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-bold text-xl">Workouts</h1>
        <button onClick={() => setShowCreate(true)} className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-5 h-5" /></button>
      </div>
      {(templates ?? []).map((t: any) => (
        <div key={t.id} className="bg-card rounded-xl p-4 mb-3 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex-1 min-w-0"><p className="font-medium">{t?.name}</p><p className="text-xs text-muted-foreground">{t?.exercises?.length ?? 0} exercises</p></div>
          <div className="flex gap-1">
            <button onClick={() => startWorkout(t.id)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"><Play className="w-4 h-4" /></button>
            <button onClick={() => deleteTemplate(t.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      ))}
      {!loading && templates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground"><Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No workout templates yet</p></div>
      )}
      <button onClick={async () => {
        const res = await fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Quick Workout' }) })
        if (res.ok) { const s = await res.json(); router.push(`/session/${s.id}`) }
      }} className="w-full mt-4 rounded-xl border border-border py-3 font-medium text-center hover:bg-accent flex items-center justify-center gap-2"><Play className="w-4 h-4" /> Start Empty Workout</button>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="p-4 border-b border-border">
              <h2 className="font-display font-bold text-lg">New Template</h2>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full mt-2 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedExercises.length > 0 && <div className="mb-3">{selectedExercises.map((ex: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-muted rounded-lg mb-1"><span className="text-sm">{ex?.name}</span><button onClick={() => setSelectedExercises(p => p.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3" /></button></div>
              ))}</div>}
              {Object.entries(grouped).map(([bp, exs]: [string, any]) => (
                <div key={bp} className="mb-3"><p className="text-xs font-medium text-muted-foreground uppercase mb-1">{bp}</p>
                  {(exs as any[]).map((ex: any) => (
                    <button key={ex.id} onClick={() => setSelectedExercises(p => [...p, ex])} className="w-full text-left py-2 px-3 hover:bg-accent rounded-lg text-sm flex items-center justify-between"><span>{ex?.name}</span><Plus className="w-3 h-3 text-muted-foreground" /></button>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border"><button onClick={createTemplate} disabled={!name || selectedExercises.length === 0} className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium disabled:opacity-50">Create Template</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
