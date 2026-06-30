'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from './auth-store'
import { Role } from '@/types'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  async function login(username: string, password: string, activeRole?: Role) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, activeRole }),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    const { user, activeRole: role, token, requireRoleSelection } = json.data
    store.setAuth(user, role, token)
    return { user, activeRole: role, requireRoleSelection }
  }

  async function register(data: {
    username: string; email: string; password: string; name: string; phone?: string; roles: Role[]
  }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    return json.data
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    store.clearAuth()
    router.push('/')
  }

  async function switchRole(role: Role) {
    const res = await fetch('/api/auth/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.token}` },
      body: JSON.stringify({ role }),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    store.setActiveRole(role, json.data.token)
    return json.data
  }

  async function fetchMe() {
    if (!store.token) return null
    const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${store.token}` } })
    if (!res.ok) { store.clearAuth(); return null }
    const json = await res.json()
    if (json.success) {
      store.setAuth({ ...json.data }, json.data.activeRole, store.token!)
      return json.data
    }
    return null
  }

  return {
    user: store.user,
    activeRole: store.activeRole,
    token: store.token,
    isLoggedIn: !!store.user,
    isLoading: store.isLoading,
    login,
    register,
    logout,
    switchRole,
    fetchMe,
  }
}