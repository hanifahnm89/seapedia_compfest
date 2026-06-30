'use client'

import { useAuthStore } from '@/features/auth/auth-store'

export function useApi() {
  const token = useAuthStore(s => s.token)

  function headers(extra?: Record<string, string>) {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    }
  }

  async function get<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, { headers: headers() })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    return json.data as T
  }

  async function post<T = unknown>(url: string, body?: unknown): Promise<T> {
    const res = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(body) })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    return json.data as T
  }

  async function put<T = unknown>(url: string, body?: unknown): Promise<T> {
    const res = await fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    return json.data as T
  }

  async function del<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, { method: 'DELETE', headers: headers() })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    return json.data as T
  }

  return { get, post, put, del }
}