'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronLeft, ChevronRight, Trash2, Camera, Search, X } from 'lucide-react'
import { calcEntryNutrition, calcTargets } from '@/lib/nutrition'
import { cn } from '@/lib/utils'
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
    setDate(new Date().toISOString().slice(0, 10))
  }, [])
  const [log, setLog] = useState<{ id: string; entries: Entry[] } | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

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

  const addEntry = async (food: FoodItem, mult = 1) => {
    await fetch('/api/daily-log', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, foodId: food.id, multiplier: mult }),
    })
    setShowAdd(false); setSearch(''); fetchData()
  }

  const deleteEntry = async (id: string) => {
    await fetch(`/api/daily-log/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const changeDate = (days: number) => {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().slice(0, 10))
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
              <button onClick={() => deleteEntry(e.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setShowAdd(true)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90"><Plus className="w-5 h-5" /> Add Food</button>
        <Link href="/scan" className="flex items-center justify-center rounded-xl bg-card border border-border px-4 py-3 hover:bg-accent"><Camera className="w-5 h-5" /></Link>
      </div>
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input autoFocus type="text" placeholder="Search foods..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm focus:outline-none" />
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {filteredFoods.map(f => {
                let presets: number[] = [0.5, 1, 2]
                try { presets = JSON.parse(f?.presets ?? '[0.5,1,2]') } catch {}
                return (
                  <div key={f.id} className="p-3 hover:bg-accent rounded-xl cursor-pointer" onClick={() => addEntry(f)}>
                    <p className="font-medium text-sm">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.typicalG}g · {Math.round((f.cal / (f.amountG || 1)) * f.typicalG)} cal</p>
                    <div className="flex gap-1 mt-1">
                      {presets.map((p: number) => (
                        <button key={p} onClick={e => { e.stopPropagation(); addEntry(f, p) }} className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-primary/20 hover:text-primary">{p}x</button>
                      ))}
                    </div>
                  </div>
                )
              })}
              {filteredFoods.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No foods found</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
