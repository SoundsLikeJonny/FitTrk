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
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFile = (file: File | null) => {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
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

  const addToDatabase = async () => {
    if (!result) return
    const res = await fetch('/api/foods', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: result.name ?? 'Scanned Food', amountG: result.servingSizeG ?? 100,
        cal: result.cal ?? 0, fatG: result.fatG ?? 0, carbG: result.carbG ?? 0,
        proteinG: result.proteinG ?? 0, typicalG: result.typicalG ?? result.servingSizeG ?? 100,
      }),
    })
    if (res.ok) { toast.success('Added to food database!'); router.push('/today') }
    else {
      const data = await res.json().catch(() => ({}))
      toast.error(data?.error ?? 'Failed to add')
    }
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
              <button onClick={addToDatabase} className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Add to Food Database
              </button>
              <button onClick={() => { setImage(null); setPreview(null); setResult(null) }} className="w-full text-sm text-muted-foreground hover:underline">Scan another</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
