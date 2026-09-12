import { Search, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

import { useStore } from '@/app/store'
import { Logo } from './Logo'

export function TopHeader({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const { student, notifications } = useStore()
  const unreadCount = notifications.filter((n) => !n.read).length
  
  const [timeStr, setTimeStr] = useState('')
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center h-[56px] md:h-[64px] lg:h-[70px] bg-gradient-to-b from-[#0f1419] to-[#1a1f2e]/50 border-b border-[rgba(99,102,241,0.1)] shadow-[0_2px_8px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.08)] backdrop-blur-md px-4 lg:px-6">
      <div className="flex items-center w-1/5 min-w-fit">
        <Link to="/app" className="flex items-center gap-2 hover-scale">
          <Logo />
          <span className="hidden lg:block text-base font-bold text-white">CampusOS</span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center justify-center w-2/5 px-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center w-[300px] h-[40px] px-3 bg-white/5 border border-[rgba(99,102,241,0.15)] rounded-lg hover:border-[rgba(99,102,241,0.4)] hover:bg-white/10 transition-colors focus-ring"
        >
          <Search className="size-5 text-ink-subtle mr-2" />
          <span className="text-[14px] text-ink-subtle truncate flex-1 text-left">Search classes, assignments, exams...</span>
          <kbd className="hidden lg:inline-block ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-ink-muted font-medium">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center justify-end flex-1 lg:w-2/5 gap-4 lg:gap-6 ml-auto">
        <div className="hidden md:flex items-center gap-2" title="Live">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
          <span className="text-[12px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
        </div>
        
        <div className="hidden sm:flex items-center gap-2" title={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}>
          <span className="text-[16px] font-bold text-[#6366f1]">{timeStr}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-[#10b981] animate-pulse"></span>
        </div>

        <button className="relative p-2 text-ink-muted hover:text-ink transition-colors hover:animate-[shake_0.3s_ease-in-out]">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white border-2 border-[#1a1f2e]">
              {unreadCount}
            </span>
          )}
        </button>

        <button className="flex items-center hover-lift group">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#6366f1] text-[14px] font-semibold text-white group-hover:shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all">
            {student.initials}
          </span>
        </button>
      </div>
    </header>
  )
}
