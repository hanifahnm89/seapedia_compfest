'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Role } from '@/types'

interface AuthStore {
  user: User | null
  activeRole: Role | null
  token: string | null
  isLoading: boolean
  setAuth: (user: User, activeRole: Role, token: string) => void
  setActiveRole: (role: Role, token: string) => void
  clearAuth: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      activeRole: null,
      token: null,
      isLoading: false,
      setAuth: (user, activeRole, token) => set({ user, activeRole, token }),
      setActiveRole: (activeRole, token) => set({ activeRole, token }),
      clearAuth: () => set({ user: null, activeRole: null, token: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'seapedia-auth', partialize: (s) => ({ user: s.user, activeRole: s.activeRole, token: s.token }) }
  )
)