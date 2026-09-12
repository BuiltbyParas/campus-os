import { HelpCircle, Settings, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { primaryNav, accountNav, type NavItem } from '@/app/navigation'
import { cn } from '@/lib/utils'

function SidebarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-[8px] rounded-[12px] px-[12px] h-[44px] text-[14px] font-normal transition-all duration-200 click-feedback',
          isActive
            ? 'bg-[rgba(99,102,241,0.15)] border-r-[3px] border-[#6366f1] text-[#ffffff]'
            : 'text-[#a0aec0] bg-transparent hover:bg-[rgba(99,102,241,0.1)] hover:border-r-[1px] hover:border-[#6366f1] hover:text-[#ffffff]'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={cn(
              'size-[20px] shrink-0 transition-colors duration-200',
              isActive ? 'text-[#6366f1]' : 'text-inherit group-hover:text-inherit'
            )}
            aria-hidden
          />
          <span className="truncate lg:block hidden">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const adminNav = accountNav.filter(n => ['Fees', 'Complaints', 'Events'].includes(n.label))

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden md:block md:w-[80px] lg:w-[240px] bg-[#0f1419] border-r border-[rgba(99,102,241,0.1)] shadow-[0_8px_24px_rgba(0,0,0,0.20),_0_4px_8px_rgba(0,0,0,0.12)] pt-[70px]">
      <div className="flex h-full flex-col overflow-y-auto px-[12px] py-[16px] scrollbar-thin scrollbar-thumb-[rgba(99,102,241,0.4)] hover:scrollbar-thumb-[rgba(99,102,241,0.6)] scrollbar-track-[rgba(99,102,241,0.1)]">
        
        <nav aria-label="Main Section" className="flex flex-col gap-1">
          {primaryNav.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="mt-4">
          <div className="hidden lg:block text-[11px] uppercase font-semibold text-[#64748b] tracking-[0.5px] mt-[16px] mb-[8px] px-3">
            Administration
          </div>
          <nav aria-label="Administration" className="flex flex-col gap-1">
            {adminNav.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-4 border-t border-[rgba(99,102,241,0.1)]">
          <nav aria-label="Bottom Section" className="flex flex-col gap-1">
            <SidebarLink item={{ label: 'Profile', to: '/app/profile', icon: User }} />
            <SidebarLink item={{ label: 'Settings', to: '/app/settings', icon: Settings }} />
            <SidebarLink item={{ label: 'Help', to: '/app/help', icon: HelpCircle }} />
          </nav>
        </div>
      </div>
    </aside>
  )
}
