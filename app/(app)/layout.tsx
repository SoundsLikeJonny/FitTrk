import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav'
import { ActiveWorkoutBanner } from '@/components/active-workout-banner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return (
    <div className="min-h-screen bg-background pb-20">
      <ActiveWorkoutBanner />
      {children}
      <BottomNav />
    </div>
  )
}
