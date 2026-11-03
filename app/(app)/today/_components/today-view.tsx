'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronLeft, ChevronRight, Trash2, Camera, Search, X, Pencil, Save } from 'lucide-react'
import { calcEntryNutrition, calcTargets } from '@/lib/nutrition'
import { cn, localDateStr } from '@/lib/utils'
import Link from 'next/link'

interface FoodItem {
  id: string; name: string; amountG: number; cal: number; fatG: number; carbG: number; proteinG: number; typicalG: number; presets: string | null
}
interface Entry {
  id: string; foodId: string; multiplier: number; amountG: number | null; order: number; food: FoodItem
}

export function TodayView() {
  const [date, setDate] = useState('')

  useEffect(() => {
    setDate(localDateStr())
  }, [])
  const [log, setLog] = useState<{ id: string; entries: Entry[] } | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [multInput, setMultInput] = useState('1')
  const [weightInput, setWeightInput] = useState('')
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const fetchData = useCallback(async () => {
    if (!date) return
    setLoading(true)
    const [logRes, settingsRes, foodsRes] = await Promise.all([
      fetch(`/api/daily-log?date=${date}`), fetch('/api/settings'), fetch('/api/foods'),
    ])
    if (logRes.ok) setLog(await logRes.json())
    if (settingsRes.ok) setSettings(await settingsRes.json())
    if (foodsRes.ok) setFoods(await foodsRes.json())
    setLoading(false)
  }, [date])

  useEffect(() => { fetchData() }, [fetchData])

  const addEntry = async (food: FoodItem, mult = 1, amountG?: number) => {
    await fetch('/api/daily-log', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, foodId: food.id, multiplier: mult, amountG: amountG ?? null }),
    })
    setShowAdd(false); setSearch(''); setSelectedFood(null); setMultInput('1'); setWeightInput(''); setEditingEntry(null); fetchData()
  }

  const selectFood = (f: FoodItem) => {
    setSelectedFood(f)
    setMultInput('1')
    setWeightInput(String(f.typicalG))
  }

  const confirmAdd = () => {
    if (!selectedFood) return
    const mult = parseFloat(multInput) || 1
    const weight = parseFloat(weightInput) || selectedFood.typicalG
    addEntry(selectedFood, mult, weight)
  }

  const startEdit = (entry: Entry) => {
    setEditingEntry(entry)
    setSelectedFood(entry.food)
    setMultInput(String(entry.multiplier ?? 1))
    setWeightInput(String(entry.amountG ?? entry.food.typicalG))
    setShowAdd(true)
  }

  const confirmEdit = async () => {
    if (!editingEntry) return
    const mult = parseFloat(multInput) || 1
    const weight = parseFloat(weightInput) || (editingEntry.food?.typicalG ?? 100)
    await fetch(`/api/daily-log/${editingEntry.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ multiplier: mult, amountG: weight }),
    })
    setShowAdd(false); setEditingEntry(null); setSelectedFood(null); setMultInput('1'); setWeightInput(''); fetchData()
  }

  const deleteEntry = async (id: string) => {
    await fetch(`/api/daily-log/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const changeDate = (days: number) => {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + days)
    setDate(localDateStr(d))
  }

  const entries = log?.entries ?? []
  const totals = entries.reduce((acc, e) => {
    const n = calcEntryNutrition({ multiplier: e?.multiplier ?? 1, amountG: e?.amountG ?? null, food: e?.food ?? { amountG: 100, cal: 0, fatG: 0, carbG: 0, proteinG: 0, typicalG: 100 } })
    return { cal: acc.cal + n.cal, fatG: acc.fatG + n.fatG, carbG: acc.carbG + n.carbG, proteinG: acc.proteinG + n.proteinG }
  }, { cal: 0, fatG: 0, carbG: 0, proteinG: 0 })

  const targets = settings ? calcTargets(settings) : null
  const filteredFoods = foods?.filter(f => f?.name?.toLowerCase()?.includes(search?.toLowerCase() ?? '')) ?? []

  const Bar = ({ value, target, label, color }: { value: number; target: number; label: string; color: string }) => {
    const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0
    const over = target > 0 && value > target
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className={cn('font-mono font-medium', over ? 'text-destructive' : '')}>{Math.round(value)}/{Math.round(target)}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', over ? 'bg-destructive' : color)} style={{ width: `${pct}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg hover:bg-accent"><ChevronLeft className="w-5 h-5" /></button>
        <div className="text-center">
          <h1 className="font-display font-bold text-lg">{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h1>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', settings?.mode === 'cut' ? 'bg-red-500/10 text-red-500' : settings?.mode === 'bulk' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary')}>
            {settings?.mode?.toUpperCase?.() ?? 'CUT'}
          </span>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 rounded-lg hover:bg-accent"><ChevronRight className="w-5 h-5" /></button>
      </div>
      {targets && (
        <div className="bg-card rounded-2xl p-4 space-y-3 mb-4" style={{ boxShadow: 'var(--shadow-md)' }}>
          <Bar value={totals.cal} target={targets.calorieMax} label="Calories" color="bg-primary" />
          <Bar value={totals.proteinG} target={targets.proteinTarget} label="Protein (g)" color="bg-blue-500" />
          <Bar value={totals.fatG} target={targets.fatMin} label="Fat (g) min" color="bg-yellow-500" />
          <Bar value={totals.carbG} target={targets.carbTarget} label="Carbs (g)" color="bg-orange-500" />
        </div>
      )}
      <div className="space-y-2 mb-4">
        {entries.map(e => {
          const n = calcEntryNutrition({ multiplier: e?.multiplier ?? 1, amountG: e?.amountG ?? null, food: e?.food ?? { amountG: 100, cal: 0, fatG: 0, carbG: 0, proteinG: 0, typicalG: 100 } })
          return (
            <div key={e.id} className="bg-card rounded-xl p-3 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{e?.food?.name ?? 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">
                  {e.multiplier !== 1 ? `${e.multiplier}x · ` : ''}{Math.round(e?.amountG ?? e?.food?.typicalG ?? 0)}g · {Math.round(n.cal)} cal · {Math.round(n.proteinG)}g P
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(e)} className="p-2 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => deleteEntry(e.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setShowAdd(true)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90"><Plus className="w-5 h-5" /> Add Food</button>
        <Link href="/scan" className="flex items-center justify-center rounded-xl bg-card border border-border px-4 py-3 hover:bg-accent"><Camera className="w-5 h-5" /></Link>
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => { setShowAdd(false); setSelectedFood(null); setEditingEntry(null) }}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
            {selectedFood ? (
              <div className="p-4 pb-6 space-y-4 overflow-y-auto">
                <div className="flex items-center gap-2">
                  <button onClick={() => { if (editingEntry) { setShowAdd(false); setSelectedFood(null); setEditingEntry(null) } else setSelectedFood(null) }} className="p-1 rounded-lg hover:bg-accent"><ChevronLeft className="w-5 h-5" /></button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{selectedFood.name}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(selectedFood.typicalG)}g typical · {Math.round((selectedFood.cal / (selectedFood.amountG || 1)) * selectedFood.typicalG)} cal</p>
                  </div>
                  <button onClick={() => { setShowAdd(false); setSelectedFood(null); setEditingEntry(null) }}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Multiplier</label>
                  <div className="flex gap-2 mt-1">
                    {(() => { let presets: number[] = [0.5, 1, 2]; try { presets = JSON.parse(selectedFood?.presets ?? '[0.5,1,2]') } catch {} return presets })().map((p: number) => (
                      <button key={p} onClick={() => setMultInput(String(p))} className={cn('text-xs px-3 py-2 rounded-lg', parseFloat(multInput) === p ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-primary/20 hover:text-primary')}>{p}x</button>
                    ))}
                    <input type="number" inputMode="decimal" value={multInput} onChange={e => setMultInput(e.target.value)}
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 3.5" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Weight (g)</label>
                  <input type="number" inputMode="decimal" value={weightInput} onChange={e => setWeightInput(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <p className="text-[10px] text-muted-foreground mt-1">Defaults to typical serving ({Math.round(selectedFood.typicalG)}g)</p>
                </div>
                {(() => {
                  const n = calcEntryNutrition({ multiplier: parseFloat(multInput) || 1, amountG: parseFloat(weightInput) || selectedFood.typicalG, food: selectedFood })
                  return (
                    <div className="rounded-xl bg-muted/50 p-3 grid grid-cols-4 gap-2 text-center">
                      <div><p className="font-mono text-sm font-medium">{Math.round(n.cal)}</p><p className="text-[10px] text-muted-foreground">cal</p></div>
                      <div><p className="font-mono text-sm font-medium text-blue-500">{Math.round(n.proteinG)}g</p><p className="text-[10px] text-muted-foreground">protein</p></div>
                      <div><p className="font-mono text-sm font-medium text-orange-500">{Math.round(n.carbG)}g</p><p className="text-[10px] text-muted-foreground">carbs</p></div>
                      <div><p className="font-mono text-sm font-medium text-yellow-500">{Math.round(n.fatG)}g</p><p className="text-[10px] text-muted-foreground">fat</p></div>
                    </div>
                  )
                })()}
                <button onClick={editingEntry ? confirmEdit : confirmAdd} className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium flex items-center justify-center gap-2 hover:bg-primary/90">{editingEntry ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />} {editingEntry ? 'Save Changes' : 'Add to Log'}</button>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input autoFocus type="text" placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm focus:outline-none" />
                  <button onClick={() => { setShowAdd(false); setEditingEntry(null) }}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {filteredFoods.map(f => (
                    <div key={f.id} className="p-3 hover:bg-accent rounded-xl cursor-pointer" onClick={() => selectFood(f)}>
                      <p className="font-medium text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(f.typicalG)}g · {Math.round((f.cal / (f.amountG || 1)) * f.typicalG)} cal</p>
                    </div>
                  ))}
                  {filteredFoods.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No foods found</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
