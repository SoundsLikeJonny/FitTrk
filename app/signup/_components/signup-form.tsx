'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell } from 'lucide-react'
import Link from 'next/link'

export function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data?.error ?? 'Signup failed'); setLoading(false); return }
      const signInRes = await signIn('credentials', { email, password, redirect: false })
      if (signInRes?.error) { setError('Account created but login failed. Try logging in.'); setLoading(false) }
      else router.replace('/today')
    } catch { setError('Something went wrong'); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">Start tracking your fitness</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)}
            minLength={6}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </div>
  )
}
