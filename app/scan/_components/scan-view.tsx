'use client'
import { useState, useRef } from 'react'
import { Camera, Upload, ArrowLeft, Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ScanView() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [duplicates, setDuplicates] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFile = (file: File | null) => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setDuplicates([])
  }

  const scan = async () => {
    if (!image) return
    setScanning(true); setProgress(0)
    const formData = new FormData()
    formData.append('image', image)
    try {
      const response = await fetch('/api/scan-label', { method: 'POST', body: formData })
      if (!response.ok) { toast.error('Failed to analyze'); setScanning(false); return }
      const reader = response.body?.getReader()
      if (!reader) { setScanning(false); return }
      const decoder = new TextDecoder()
      let partialRead = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        partialRead += decoder.decode(value, { stream: true })
        const lines = partialRead.split('\n')
        partialRead = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6))
              if (parsed.status === 'processing') setProgress(p => Math.min(p + 5, 95))
              else if (parsed.status === 'completed') { setResult(parsed.result); setScanning(false); setProgress(100); return }
              else if (parsed.status === 'error') { toast.error(parsed.message); setScanning(false); return }
            } catch {}
          }
        }
      }
    } catch (e: any) { toast.error('Scan failed'); }
    setScanning(false)
  }

  const addToDatabase = async (force = false) => {
    if (!result) return
    const res = await fetch('/api/foods', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: result.name ?? 'Scanned Food', amountG: result.servingSizeG ?? 100,
        cal: result.cal ?? 0, fatG: result.fatG ?? 0, carbG: result.carbG ?? 0,
        proteinG: result.proteinG ?? 0, typicalG: result.typicalG ?? result.servingSizeG ?? 100,
        force,
      }),
    })
    if (res.ok) { toast.success('Added to food database!'); router.push('/today') }
    else if (res.status === 409) {
      const data = await res.json().catch(() => ({}))
      setDuplicates(data?.foods ?? [])
    }
    else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error ?? 'Failed to add')
    }
  }

  const applyExisting = async (food: any) => {
    const res = await fetch('/api/daily-log', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: new Date().toISOString().slice(0, 10), foodId: food.id, multiplier: 1 }),
    })
    if (res.ok) toast.success(`Logged ${food.name}`)
    else toast.error('Failed to log food')
    router.push('/today')
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-accent"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-display font-bold text-xl">Scan Label</h1>
      </div>

      {!preview ? (
        <div className="space-y-3">
          <button onClick={() => inputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:bg-accent/50 transition-colors">
            <Camera className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Take photo or upload image</p>
          </button>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[4/3]">
            <img src={preview} alt="Label preview" className="w-full h-full object-contain" />
          </div>
          {!result && (
            <button onClick={scan} disabled={scanning}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {scanning ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing... {progress}%</> : <><Upload className="w-4 h-4" /> Analyze Label</>}
            </button>
          )}
          {result && (
            <div className="bg-card rounded-2xl p-4 space-y-3" style={{ boxShadow: 'var(--shadow-md)' }}>
              <h2 className="font-medium">{result?.name ?? 'Scanned Food'}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted rounded-lg p-2"><p className="text-xs text-muted-foreground">Serving</p><p className="font-mono">{result?.servingSizeG ?? '--'}g</p></div>
                <div className="bg-muted rounded-lg p-2"><p className="text-xs text-muted-foreground">Calories</p><p className="font-mono">{result?.cal ?? '--'}</p></div>
                <div className="bg-muted rounded-lg p-2"><p className="text-xs text-muted-foreground">Protein</p><p className="font-mono">{result?.proteinG ?? '--'}g</p></div>
                <div className="bg-muted rounded-lg p-2"><p className="text-xs text-muted-foreground">Fat</p><p className="font-mono">{result?.fatG ?? '--'}g</p></div>
                <div className="bg-muted rounded-lg p-2"><p className="text-xs text-muted-foreground">Carbs</p><p className="font-mono">{result?.carbG ?? '--'}g</p></div>
              </div>
              {duplicates.length > 0 && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-2">
                  <p className="text-sm font-medium text-primary">Already in database</p>
                  <p className="text-xs text-muted-foreground">A food with this name already exists. Use the database version or add it anyway.</p>
                  {duplicates.map(f => (
                    <div key={f.id} className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(f.typicalG)}g · {Math.round((f.cal / (f.amountG || 1)) * f.typicalG)} cal · {Math.round((f.proteinG / (f.amountG || 1)) * f.typicalG)}g P</p>
                      </div>
                      <button onClick={() => applyExisting(f)} className="shrink-0 text-primary text-xs font-medium px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/10">Use this</button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => addToDatabase(duplicates.length > 0)} className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> {duplicates.length > 0 ? 'Add to database anyway' : 'Add to Food Database'}
              </button>
              <button onClick={() => { setImage(null); setPreview(null); setResult(null); setDuplicates([]) }} className="w-full text-sm text-muted-foreground hover:underline">Scan another</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
