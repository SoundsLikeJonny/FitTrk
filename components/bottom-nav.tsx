'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UtensilsCrossed, Dumbbell, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/today', label: 'Today', icon: UtensilsCrossed },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(t => {
          const active = pathname?.startsWith(t.href)
          return (
            <Link key={t.href} href={t.href}
              className={cn('flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[64px]',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
              <t.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{t.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
