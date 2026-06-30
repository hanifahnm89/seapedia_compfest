'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface DashboardLayoutProps {
  children: ReactNode
  navItems: NavItem[]
  title: string
  roleColor: string
}

export function DashboardLayout({ children, navItems, title, roleColor }: DashboardLayoutProps) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-100 hidden md:flex flex-col fixed h-screen top-16 z-40">
        <div className={cn('px-4 py-4 border-b border-slate-100')}>
          <span className={cn('text-xs font-semibold uppercase tracking-wider', roleColor)}>{title}</span>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                  active ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-56 pt-4 px-4 pb-10 max-w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}