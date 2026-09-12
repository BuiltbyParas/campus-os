import { NavLink } from 'react-router-dom'
import { LayoutGrid, Book, Star, CheckCircle, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const mobileTabs = [
  { label: 'Dashboard', to: '/app', icon: LayoutGrid, end: true },
  { label: 'Classes', to: '/app/timetable', icon: Book },
  { label: 'Grades', to: '/app/academics', icon: Star },
  { label: 'Attendance', to: '/app/attendance', icon: CheckCircle },
]

export function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav
        aria-label="Mobile Bottom"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden h-[60px] bg-gradient-to-t from-[#0f1419] to-[#1a1f2e] border-t border-[rgba(99,102,241,0.1)] shadow-[0_-8px_24px_rgba(0,0,0,0.20)] pb-safe flex"
      >
        {mobileTabs.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-1/5 h-full py-[8px] transition-colors duration-200',
                isActive
                  ? 'text-[#6366f1] bg-[rgba(99,102,241,0.1)]'
                  : 'text-[#a0aec0] bg-transparent hover:bg-[rgba(99,102,241,0.08)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="size-[24px]" aria-hidden />
                <span className="text-[10px] font-bold mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        
        {/* More Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            'flex flex-col items-center justify-center w-1/5 h-full py-[8px] transition-colors duration-200',
            menuOpen
              ? 'text-[#6366f1] bg-[rgba(99,102,241,0.1)]'
              : 'text-[#a0aec0] bg-transparent hover:bg-[rgba(99,102,241,0.08)]'
          )}
        >
          <Menu className="size-[24px]" aria-hidden />
          <span className="text-[10px] font-bold mt-1">More</span>
        </button>
      </nav>

      {/* More Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute bottom-[60px] inset-x-0 bg-[#1a1f2e] rounded-t-[16px] border-t border-[rgba(99,102,241,0.1)] p-4 flex flex-col gap-2 pb-safe" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-[#475569] rounded-full mx-auto mb-4" />
            
            <NavLink to="/app/fees" className="flex items-center gap-3 p-3 text-[#e2e8f0] hover:bg-[rgba(99,102,241,0.1)] rounded-[8px]" onClick={() => setMenuOpen(false)}>
              Fees
            </NavLink>
            <NavLink to="/app/complaints" className="flex items-center gap-3 p-3 text-[#e2e8f0] hover:bg-[rgba(99,102,241,0.1)] rounded-[8px]" onClick={() => setMenuOpen(false)}>
              Complaints
            </NavLink>
            <NavLink to="/app/events" className="flex items-center gap-3 p-3 text-[#e2e8f0] hover:bg-[rgba(99,102,241,0.1)] rounded-[8px]" onClick={() => setMenuOpen(false)}>
              Events
            </NavLink>
            
            <div className="h-px bg-white/5 my-2" />
            
            <NavLink to="/app/profile" className="flex items-center gap-3 p-3 text-[#e2e8f0] hover:bg-[rgba(99,102,241,0.1)] rounded-[8px]" onClick={() => setMenuOpen(false)}>
              Profile & Settings
            </NavLink>
          </div>
        </div>
      )}
    </>
  )
}
