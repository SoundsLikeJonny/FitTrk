'use client'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { Save, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsView() {
  const { data: session } = useSession()
  const [s, setS] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/settings').then(async r => { if (r.ok) setS(await r.json()) }) }, [])

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
    if (res.ok) toast.success('Settings saved')
    else toast.error('Failed to save')
    setSaving(false)
  }

  if (!s) return <div className="max-w-lg mx-auto px-4 pt-4"><p className="text-muted-foreground">Loading...</p></div>

  const Field = ({ label, field, type = 'number', step }: { label: string; field: string; type?: string; step?: string }) => (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type={type} step={step} value={s?.[field] ?? ''} onChange={e => setS((p: any) => ({ ...(p ?? {}), [field]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
        className="w-full mt-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 pt-4">
      <h1 className="font-display font-bold text-xl mb-4">Settings</h1>
      <div className="bg-card rounded-2xl p-4 space-y-4 mb-4" style={{ boxShadow: 'var(--shadow-md)' }}>
        <p className="text-sm font-medium">{session?.user?.name ?? session?.user?.email ?? 'User'}</p>
        <Field label="Current Weight (lb)" field="weightLb" />
        <div>
          <label className="text-xs text-muted-foreground">Mode</label>
          <div className="flex gap-2 mt-1">
            {['cut', 'maintain', 'bulk'].map(m => (
              <button key={m} onClick={() => setS((p: any) => ({ ...(p ?? {}), mode: m }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${s?.mode === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                {m?.toUpperCase?.()}
              </button>
            ))}
          </div>
        </div>
        {s?.mode === 'cut' && <Field label="Cut Deficit (cal)" field="cutDeficit" />}
        {s?.mode === 'bulk' && <Field label="Bulk Surplus (cal)" field="bulkSurplus" />}
        <Field label="Cal Multiplier (×weight)" field="calMultiplier" step="0.1" />
        <Field label="Protein Multiplier (×weight)" field="proteinMultiplier" step="0.1" />
        <Field label="Protein Min Multiplier" field="proteinMinMultiplier" step="0.1" />
        <Field label="Fat Min Multiplier" field="fatMinMultiplier" step="0.1" />
        <Field label="Default Rest Timer (sec)" field="restTimerDefault" />
        <button onClick={save} disabled={saving} className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
      <button onClick={() => signOut({ redirectTo: '/login' })} className="w-full rounded-xl border border-destructive text-destructive py-3 font-medium flex items-center justify-center gap-2 hover:bg-destructive/10">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  )
}
