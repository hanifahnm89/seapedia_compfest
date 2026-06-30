'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/use-auth'
import { RoleBadge } from '../ui/badge'
import { Button } from '../ui/button'
import { ShoppingCart, Package, Store, Truck, Shield, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Role } from '@/types'

const ROLE_DASHBOARD: Record<Role, string> = {
  BUYER: '/buyer',
  SELLER: '/seller',
  DRIVER: '/driver',
  ADMIN: '/admin',
}

const ROLE_ICON: Record<Role, React.ReactNode> = {
  BUYER: <ShoppingCart size={14} />,
  SELLER: <Store size={14} />,
  DRIVER: <Truck size={14} />,
  ADMIN: <Shield size={14} />,
}

export function Navbar() {
  const { user, activeRole, isLoggedIn, logout, switchRole } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const router = useRouter()

  const handleSwitch = async (role: Role) => {
    await switchRole(role)
    setRoleOpen(false)
    router.push(ROLE_DASHBOARD[role])
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">SEAPEDIA</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Produk</Link>
            <Link href="/reviews" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Ulasan</Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Active role badge + switch */}
                {user && user.roles.filter(r => r !== 'ADMIN').length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setRoleOpen(!roleOpen)}
                      className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-teal-600 transition-colors"
                    >
                      {activeRole && <RoleBadge role={activeRole} />}
                      <ChevronDown size={14} />
                    </button>
                    {roleOpen && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                        {user.roles.filter(r => r !== 'ADMIN').map(role => (
                          <button
                            key={role}
                            onClick={() => handleSwitch(role)}
                            className={cn('w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors', activeRole === role && 'text-teal-600 font-medium')}
                          >
                            {ROLE_ICON[role as Role]}
                            {role.charAt(0) + role.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Dashboard link */}
                {activeRole && (
                  <Link href={ROLE_DASHBOARD[activeRole as Role]} className="hidden md:flex items-center gap-1.5 text-sm text-slate-600 hover:text-teal-600 transition-colors">
                    <Package size={15} />
                    Dashboard
                  </Link>
                )}

                {/* User menu */}
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 hover:text-teal-600 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">@{user?.username}</p>
                      </div>
                      {activeRole && (
                        <Link href={ROLE_DASHBOARD[activeRole as Role]} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 md:hidden">
                          <User size={14} /> Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setMenuOpen(false) }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"><Button variant="ghost" size="sm">Masuk</Button></Link>
                <Link href="/register"><Button size="sm">Daftar</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}