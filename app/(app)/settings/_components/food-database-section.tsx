'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, X, Save, Loader2, Database } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Food {
  id: string; name: string; amountG: number; cal: number; fatG: number; carbG: number; proteinG: number;
  typicalG: number; isCustom: boolean; presets: string | null
}
interface FormState { name: string; amountG: string; cal: string; fatG: string; carbG: string; proteinG: string; typicalG: string }

const emptyForm: FormState = { name: '', amountG: '100', cal: '0', fatG: '0', carbG: '0', proteinG: '0', typicalG: '100' }
const foodToForm = (f: Food): FormState => ({
  name: f.name, amountG: String(f.amountG), cal: String(f.cal), fatG: String(f.fatG),
  carbG: String(f.carbG), proteinG: String(f.proteinG), typicalG: String(f.typicalG),
})
const calPerTypical = (f: Food) => Math.round((f.cal / (f.amountG || 1)) * f.typicalG)
const proteinPerTypical = (f: Food) => Math.round((f.proteinG / (f.amountG || 1)) * f.typicalG)

function Field({ label, value, onChange, type = 'number' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full mt-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  )
}

export function FoodDatabaseSection() {
  const [foods, setFoods] = useState<Food[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Food | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [dupes, setDupes] = useState<Food[] | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchFoods = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/foods')
    if (res.ok) setFoods(await res.json())
    setLoading(false)
  }, [])
  useEffect(() => { fetchFoods() }, [fetchFoods])

  const toPayload = (force: boolean) => ({
    name: form.name.trim(),
    amountG: parseFloat(form.amountG) || 100,
    cal: parseFloat(form.cal) || 0,
    fatG: parseFloat(form.fatG) || 0,
    carbG: parseFloat(form.carbG) || 0,
    proteinG: parseFloat(form.proteinG) || 0,
    typicalG: parseFloat(form.typicalG) || 100,
    force,
  })

  const save = async (force = false) => {
    if (!form.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    const res = editing
      ? await fetch(`/api/foods/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toPayload(force)) })
      : await fetch('/api/foods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toPayload(force)) })
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Food updated' : 'Food added')
      setOpen(false); setDupes(null); fetchFoods()
    } else {
      const data = await res.json().catch(() => ({}))
      if (res.status === 409 && data?.foods?.length) setDupes(data.foods)
      else toast.error(data?.error ?? 'Failed to save')
    }
  }

  const remove = async (food: Food) => {
    if (!window.confirm(`Delete "${food.name}" from the database?`)) return
    const res = await fetch(`/api/foods/${food.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Food deleted'); fetchFoods() }
    else { const data = await res.json().catch(() => ({})); toast.error(data?.error ?? 'Failed to delete') }
  }

  const applyExisting = (food: Food) => {
    setEditing(food); setForm(foodToForm(food)); setDupes(null)
  }

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDupes(null); setOpen(true) }
  const openEdit = (food: Food) => { setEditing(food); setForm(foodToForm(food)); setDupes(null); setOpen(true) }
  const close = () => { if (saving) return; setOpen(false); setDupes(null) }

  const filtered = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="bg-card rounded-2xl p-4 space-y-3 mb-4" style={{ boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Food Database</h2>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Manually add foods or edit nutrition data. {foods.length} foods in your database.
      </p>

      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search foods..."
          className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {loading ? (
          <p className="text-center text-muted-foreground text-xs py-4">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-xs py-4">No foods found</p>
        ) : filtered.map(f => (
          <div key={f.id} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <span className={cn('text-[9px] px-1 py-0.5 rounded-full font-medium shrink-0', f.isCustom ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>
                  {f.isCustom ? 'Custom' : 'DB'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{Math.round(f.typicalG)}g · {calPerTypical(f)} cal · {proteinPerTypical(f)}g P</p>
            </div>
            <button onClick={() => openEdit(f)} className="p-1.5 text-muted-foreground hover:text-primary" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={() => remove(f)} className="p-1.5 text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={close}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-4 pb-6 space-y-4" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">{editing ? 'Edit Food' : 'Add Food'}</h2>
              <button onClick={close}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            {dupes && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-2">
                <p className="text-sm font-medium text-primary">Already in database</p>
                <p className="text-xs text-muted-foreground">A food named "{form.name}" already exists. Use the existing one or save anyway.</p>
                {dupes.map(f => (
                  <button key={f.id} onClick={() => applyExisting(f)}
                    className="w-full text-left bg-background border border-border rounded-lg p-2 hover:bg-accent">
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(f.typicalG)}g · {calPerTypical(f)} cal · {proteinPerTypical(f)}g P</p>
                  </button>
                ))}
                <button onClick={() => save(true)} disabled={saving}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save anyway
                </button>
              </div>
            )}
            <Field label="Name" type="text" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Calories" value={form.cal} onChange={v => setForm(p => ({ ...p, cal: v }))} />
              <Field label="Protein (g)" value={form.proteinG} onChange={v => setForm(p => ({ ...p, proteinG: v }))} />
              <Field label="Fat (g)" value={form.fatG} onChange={v => setForm(p => ({ ...p, fatG: v }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Carbs (g)" value={form.carbG} onChange={v => setForm(p => ({ ...p, carbG: v }))} />
              <Field label="Per (g)" value={form.amountG} onChange={v => setForm(p => ({ ...p, amountG: v }))} />
              <Field label="Typical (g)" value={form.typicalG} onChange={v => setForm(p => ({ ...p, typicalG: v }))} />
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Enter nutrition per the "Per (g)" amount (e.g. 100g). "Typical (g)" is the default serving you eat.
            </p>
            <button onClick={() => save()} disabled={saving}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editing ? 'Save Changes' : 'Add to Database'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
