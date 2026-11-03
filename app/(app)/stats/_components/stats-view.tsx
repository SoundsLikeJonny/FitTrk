'use client'
import { useState, useEffect, useCallback } from 'react'
import { BarChart3, Flame, Beef, Droplet, Wheat } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { cn, localDateStr } from '@/lib/utils'
import { calcTargets, type SettingsData } from '@/lib/nutrition'

interface DayData {
  date: string; cal: number; proteinG: number; fatG: number; carbG: number
}

export function StatsView() {
  const [data, setData] = useState<DayData[]>([])
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'cal' | 'macros'>('cal')

  const fetchData = useCallback(async () => {
    const today = localDateStr()
    const [statsRes, settingsRes] = await Promise.all([
      fetch(`/api/daily-log/stats?date=${today}`),
      fetch('/api/settings'),
    ])
    if (statsRes.ok) setData(await statsRes.json())
    if (settingsRes.ok) setSettings(await settingsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const targets = settings ? calcTargets(settings) : null
  const chartData = data.map(d => ({
    ...d,
    label: new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const loggedDays = data.filter(d => d.cal > 0)
  const avgCal = loggedDays.length ? Math.round(loggedDays.reduce((a, d) => a + d.cal, 0) / loggedDays.length) : 0
  const avgProtein = loggedDays.length ? Math.round(loggedDays.reduce((a, d) => a + d.proteinG, 0) / loggedDays.length) : 0
  const avgFat = loggedDays.length ? Math.round(loggedDays.reduce((a, d) => a + d.fatG, 0) / loggedDays.length) : 0
  const avgCarbs = loggedDays.length ? Math.round(loggedDays.reduce((a, d) => a + d.carbG, 0) / loggedDays.length) : 0

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.5rem',
    fontSize: '12px',
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h1 className="font-display font-bold text-xl mb-4">Stats</h1>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground"><BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" /><p>Loading...</p></div>
      ) : loggedDays.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No food entries in the last 30 days</p></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-card rounded-xl p-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Avg Calories</span>
              </div>
              <p className="font-mono text-lg font-semibold">{avgCal}</p>
            </div>
            <div className="bg-card rounded-xl p-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Beef className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-muted-foreground">Avg Protein</span>
              </div>
              <p className="font-mono text-lg font-semibold">{avgProtein}<span className="text-sm text-muted-foreground">g</span></p>
            </div>
            <div className="bg-card rounded-xl p-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Droplet className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Avg Fat</span>
              </div>
              <p className="font-mono text-lg font-semibold">{avgFat}<span className="text-sm text-muted-foreground">g</span></p>
            </div>
            <div className="bg-card rounded-xl p-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Wheat className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs text-muted-foreground">Avg Carbs</span>
              </div>
              <p className="font-mono text-lg font-semibold">{avgCarbs}<span className="text-sm text-muted-foreground">g</span></p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setView('cal')} className={cn('flex-1 rounded-lg py-2 text-sm font-medium', view === 'cal' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>Calories</button>
            <button onClick={() => setView('macros')} className={cn('flex-1 rounded-lg py-2 text-sm font-medium', view === 'macros' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>Macros</button>
          </div>

          <div className="bg-card rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-md)' }}>
            {view === 'cal' ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  {targets && <ReferenceLine y={targets.calorieMax} stroke="hsl(var(--primary))" strokeDasharray="5 5" strokeWidth={1} label={{ value: 'target', fontSize: 9, fill: 'hsl(var(--primary))', position: 'right' }} />}
                  <Line type="monotone" dataKey="cal" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} name="Calories" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  {targets && <ReferenceLine y={targets.proteinTarget} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={1} />}
                  <Line type="monotone" dataKey="proteinG" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} name="Protein (g)" connectNulls />
                  <Line type="monotone" dataKey="fatG" stroke="#eab308" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} name="Fat (g)" connectNulls />
                  <Line type="monotone" dataKey="carbG" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} name="Carbs (g)" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground justify-center">
            {view === 'cal' ? (
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-primary" />Calories</span>
            ) : (
              <>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-blue-500" />Protein</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-yellow-500" />Fat</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-orange-500" />Carbs</span>
              </>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-1">Last 30 days · {loggedDays.length} days logged</p>
        </>
      )}
    </div>
  )
}
