'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, X, Save, Loader2, Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Exercise {
  id: string; name: string; bodyPart: string; category: string; weightType: string
  restSeconds: number; defaultSets: number; defaultReps: number; isCustom: boolean
}
interface FormState {
  name: string; bodyPart: string; category: string; weightType: string
  restSeconds: string; defaultSets: string; defaultReps: string
}

const BODY_PARTS = ['chest', 'legs', 'back', 'shoulders', 'arms', 'core']
const CATEGORIES = ['compound', 'isolation']
const WEIGHT_TYPES = ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight']

const emptyForm: FormState = {
  name: '', bodyPart: 'chest', category: 'compound', weightType: 'barbell',
  restSeconds: '90', defaultSets: '3', defaultReps: '10',
}
const exerciseToForm = (e: Exercise): FormState => ({
  name: e.name, bodyPart: e.bodyPart, category: e.category, weightType: e.weightType,
  restSeconds: String(e.restSeconds), defaultSets: String(e.defaultSets), defaultReps: String(e.defaultReps),
})

function Field({ label, value, onChange, type = 'number' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full mt-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full mt-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring capitalize">
        {options.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
    </div>
  )
}

export function ExerciseDatabaseSection() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchExercises = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/exercises')
    if (res.ok) setExercises(await res.json())
    setLoading(false)
  }, [])
  useEffect(() => { fetchExercises() }, [fetchExercises])

  const toPayload = () => ({
    name: form.name.trim(),
    bodyPart: form.bodyPart,
    category: form.category,
    weightType: form.weightType,
    restSeconds: parseInt(form.restSeconds) || 90,
    defaultSets: parseInt(form.defaultSets) || 3,
    defaultReps: parseInt(form.defaultReps) || 10,
  })

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    const res = editing
      ? await fetch(`/api/exercises/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toPayload()) })
      : await fetch('/api/exercises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toPayload()) })
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Exercise updated' : 'Exercise added')
      setOpen(false); fetchExercises()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error ?? 'Failed to save')
    }
  }

  const remove = async (ex: Exercise) => {
    if (!window.confirm(`Delete "${ex.name}" from your exercises?`)) return
    const res = await fetch(`/api/exercises/${ex.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Exercise deleted'); fetchExercises() }
    else { const data = await res.json().catch(() => ({})); toast.error(data?.error ?? 'Failed to delete') }
  }

  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (ex: Exercise) => { setEditing(ex); setForm(exerciseToForm(ex)); setOpen(true) }
  const close = () => { if (saving) return; setOpen(false) }

  const filtered = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = !filter || e.bodyPart === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="bg-card rounded-2xl p-4 space-y-3 mb-4" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Exercise Database</h2>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Add custom exercises with muscle group, default sets &amp; reps. {exercises.length} exercises available.
      </p>

      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..."
          className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setFilter('')} className={cn('text-[10px] px-2.5 py-1 rounded-full font-medium', !filter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent')}>All</button>
        {BODY_PARTS.map(bp => (
          <button key={bp} onClick={() => setFilter(bp)} className={cn('text-[10px] px-2.5 py-1 rounded-full font-medium capitalize', filter === bp ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent')}>{bp}</button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {loading ? (
          <p className="text-center text-muted-foreground text-xs py-4">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-xs py-4">No exercises found</p>
        ) : filtered.map(e => (
          <div key={e.id} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{e.name}</p>
                <span className={cn('text-[9px] px-1 py-0.5 rounded-full font-medium shrink-0 capitalize', e.isCustom ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                  {e.isCustom ? 'Custom' : 'DB'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground capitalize">
                {e.bodyPart} · {e.category} · {e.weightType} · {e.defaultSets}×{e.defaultReps} · {e.restSeconds}s rest
              </p>
            </div>
            {e.isCustom && (
              <>
                <button onClick={() => openEdit(e)} className="p-1.5 text-muted-foreground hover:text-primary" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(e)} className="p-1.5 text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              </>
            )}
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={close}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-4 pb-6 space-y-4" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">{editing ? 'Edit Exercise' : 'Add Exercise'}</h2>
              <button onClick={close}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <Field label="Name" type="text" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
            <Select label="Muscle Group" value={form.bodyPart} onChange={v => setForm(p => ({ ...p, bodyPart: v }))} options={BODY_PARTS} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} options={CATEGORIES} />
              <Select label="Weight Type" value={form.weightType} onChange={v => setForm(p => ({ ...p, weightType: v }))} options={WEIGHT_TYPES} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Default Sets" value={form.defaultSets} onChange={v => setForm(p => ({ ...p, defaultSets: v }))} />
              <Field label="Default Reps" value={form.defaultReps} onChange={v => setForm(p => ({ ...p, defaultReps: v }))} />
              <Field label="Rest (sec)" value={form.restSeconds} onChange={v => setForm(p => ({ ...p, restSeconds: v }))} />
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Default sets &amp; reps pre-fill when this exercise is added to a workout.
            </p>
            <button onClick={save} disabled={saving}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editing ? 'Save Changes' : 'Add to Database'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
